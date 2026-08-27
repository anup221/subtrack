package com.subtrack.subtrack.auth;

import com.subtrack.subtrack.auth.dto.AuthResponse;
import com.subtrack.subtrack.auth.dto.LoginRequest;
import com.subtrack.subtrack.auth.dto.SignupRequest;
import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.subscription.SubscriptionService;
import com.subtrack.subtrack.user.Role;
import com.subtrack.subtrack.user.User;
import com.subtrack.subtrack.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SubscriptionService subscriptionService;

    public AuthResponse signup(SignupRequest request) {
        Organization org = new Organization();
        org.setName(request.organizationName());
        organizationRepository.save(org);

        User user = new User();
        user.setOrganizationId(org.getId());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.OWNER);
        userRepository.save(user);

        subscriptionService.createTrialSubscription(org.getId());

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), org.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getOrganizationId());
    }
}