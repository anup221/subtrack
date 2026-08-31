package com.subtrack.subtrack.auth;

import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.tenant.TenantContext;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final OrganizationRepository organizationRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {

            String token = header.substring(7);

            if (jwtService.isValid(token)) {

                Claims claims = jwtService.parseClaims(token);

                String email = claims.getSubject();

                /*
                 * Platform admin token.
                 *
                 * Admin tokens contain:
                 *
                 * userType = PLATFORM_ADMIN
                 *
                 * They deliberately do NOT contain organizationId.
                 */
                String userType = claims.get("userType", String.class);

                if ("PLATFORM_ADMIN".equals(userType)) {

                    List<SimpleGrantedAuthority> authorities =
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_PLATFORM_ADMIN"
                                    )
                            );

                    var auth =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);

                    /*
                     * IMPORTANT:
                     * Do not set TenantContext for platform admins.
                     *
                     * Admins operate across all organizations.
                     */

                } else {

                    /*
                     * Normal organization / owner user.
                     */
                    String role =
                            claims.get("role", String.class);

                    String organizationIdClaim =
                            claims.get(
                                    "organizationId",
                                    String.class
                            );

                    /*
                     * A normal user MUST have an organizationId.
                     */
                    if (organizationIdClaim == null) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    UUID organizationId;

                    try {
                        organizationId =
                                UUID.fromString(
                                        organizationIdClaim
                                );
                    } catch (IllegalArgumentException e) {

                        filterChain.doFilter(request, response);
                        return;
                    }

                    /*
                     * Check the organization before allowing
                     * the request to continue.
                     *
                     * This means an admin can deactivate an
                     * organization and its users immediately
                     * lose access on their next request.
                     */
                    Organization organization =
                            organizationRepository
                                    .findById(organizationId)
                                    .orElse(null);

                    if (organization == null
                            || !"ACTIVE".equals(
                            organization.getStatus()
                    )) {

                        SecurityContextHolder
                                .clearContext();

                        filterChain.doFilter(
                                request,
                                response
                        );

                        return;
                    }

                    /*
                     * Organization is active, so establish
                     * tenant context.
                     */
                    TenantContext.set(organizationId);

                    List<SimpleGrantedAuthority> authorities =
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_" + role
                                    )
                            );

                    var auth =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    authorities
                            );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);
                }
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}