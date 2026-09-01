package com.subtrack.subtrack.auth;

import com.subtrack.subtrack.admin.AdminUser;
import com.subtrack.subtrack.admin.AdminUserRepository;
import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.subscription.SubscriptionService;
import com.subtrack.subtrack.user.Role;
import com.subtrack.subtrack.user.User;
import com.subtrack.subtrack.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final SubscriptionService subscriptionService;
    private final JwtService jwtService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String registrationId = extractRegistrationId(request);

        String token = null;
        String type;
        String error = null;

        if (email == null || email.isBlank()) {
            error = "Google did not return an email address for this account.";
            type = "organization".equals(registrationId) ? "organization" : "admin";
        } else if ("google-admin".equals(registrationId)) {
            // Admins must already exist — Google login for admins does NOT auto-create accounts,
            // matching the same "admins are provisioned, not self-service" principle as local signup.
            AdminUser admin = adminUserRepository.findByEmail(email).orElse(null);

            if (admin == null) {
                error = "No admin account exists for this Google email. Please use a provisioned admin account.";
                type = "admin";
            } else {
                token = jwtService.generateAdminToken(admin.getEmail());
                type = "admin";
            }
        } else {
            // Organization (org user) flow — a blocked org is rejected up front;
            // the admin suspension must hold even for OAuth logins.
            String orgError = orgLoginGate(email);

            if (orgError != null) {
                error = orgError;
                type = "organization";
            } else {
                token = handleOrgLogin(email);
                type = "organization";
            }
        }

        // Build the redirect with encoded query values so a long JWT or user-facing
        // error message is carried safely to the frontend.
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(frontendUrl + "/oauth-complete")
                .queryParam("type", type);

        if (error != null) {
            builder.queryParam("error", error);
        } else {
            builder.queryParam("token", token);
        }

        response.sendRedirect(builder.build().toUriString());
    }

    private String handleOrgLogin(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            Organization org = organizationRepository
                    .findById(user.getOrganizationId())
                    .orElse(null);

            // If the user's previous organization was deleted, their old
            // workspace no longer exists. Give them a fresh organization
            // (on the Free plan) so Google sign-in always succeeds instead
            // of landing on a deleted workspace. The existing user row is
            // reused (email is unique) and simply moved to the new org.
            // Blocked orgs are NOT re-provisioned — an admin suspension must hold.
            if (org != null && "DELETED".equals(org.getStatus())) {
                user = reprovisionOrg(user);
            }
        } else {
            // First-time Google sign-in for this email — provision a new
            // organization automatically, same as a normal signup would.
            user = provisionOrg(email);
        }

        return jwtService.generateToken(user);
    }

    /**
     * Returns null if the given email may proceed with OAuth org login, or a
     * user-facing error message if the user's organization is blocked by an
     * admin. First-time emails (no user row yet) always pass the gate.
     */
    private String orgLoginGate(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return null;
        }

        Organization org = organizationRepository
                .findById(user.getOrganizationId())
                .orElse(null);

        if (org != null && "BLOCKED".equals(org.getStatus())) {
            return "Your workspace has been blocked by the platform admin. Contact support for help.";
        }

        return null;
    }

    /**
     * Re-points an existing user (whose previous org was deleted) at a
     * brand-new organization on the Free plan. The user row is UPDATEd,
     * never re-inserted, because email addresses are unique.
     */
    private User reprovisionOrg(User user) {
        Organization org = new Organization();
        org.setName(user.getEmail().split("@")[0] + "'s Organization");
        organizationRepository.save(org);

        user.setOrganizationId(org.getId());
        user.setRole(Role.OWNER);
        user.setPasswordHash(""); // Google-authenticated users have no local password
        userRepository.save(user);

        subscriptionService.createFreeSubscription(org.getId());

        return user;
    }

    private User provisionOrg(String email) {
        Organization org = new Organization();
        org.setName(email.split("@")[0] + "'s Organization");
        organizationRepository.save(org);

        User user = new User();
        user.setOrganizationId(org.getId());
        user.setEmail(email);
        user.setPasswordHash(""); // Google-authenticated users have no local password
        user.setRole(Role.OWNER);
        userRepository.save(user);

        subscriptionService.createFreeSubscription(org.getId());

        return user;
    }

    private String extractRegistrationId(HttpServletRequest request) {
        // The registrationId is embedded in the callback path: /login/oauth2/code/{registrationId}
        String path = request.getRequestURI();
        String registrationId = path.substring(path.lastIndexOf('/') + 1);

        if (registrationId.isEmpty()) {
            registrationId = "google-org";
        }

        return registrationId;
    }
}