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

        String token;
        if ("google-admin".equals(registrationId)) {
            token = handleAdminLogin(email);
        } else {
            token = handleOrgLogin(email);
        }

        response.sendRedirect(frontendUrl + "/oauth-complete?token=" + token);
    }

    private String handleAdminLogin(String email) {
        // Admins must already exist — Google login for admins does NOT auto-create accounts,
        // matching the same "admins are provisioned, not self-service" principle as local signup.
        AdminUser admin = adminUserRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("No admin account exists for this email"));
        return jwtService.generateAdminToken(admin.getEmail());
    }

    private String handleOrgLogin(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // First-time Google sign-in for this email — provision a new organization automatically,
            // same as a normal signup would, using the email's name portion as a starting org name.
            Organization org = new Organization();
            org.setName(email.split("@")[0] + "'s Organization");
            organizationRepository.save(org);

            user = new User();
            user.setOrganizationId(org.getId());
            user.setEmail(email);
            user.setPasswordHash(""); // Google-authenticated users have no local password
            user.setRole(Role.OWNER);
            userRepository.save(user);

            subscriptionService.createTrialSubscription(org.getId());
        }

        return jwtService.generateToken(user);
    }

    private String extractRegistrationId(HttpServletRequest request) {
        // The registrationId is embedded in the callback path: /login/oauth2/code/{registrationId}
        String path = request.getRequestURI();
        return path.substring(path.lastIndexOf('/') + 1);
    }
}