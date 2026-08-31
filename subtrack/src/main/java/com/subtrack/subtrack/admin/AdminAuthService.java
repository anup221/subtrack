package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminAuthResponse;
import com.subtrack.subtrack.admin.dto.AdminLoginRequest;
import com.subtrack.subtrack.admin.dto.AdminSignupRequest;
import com.subtrack.subtrack.auth.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${admin.bootstrap-code}")
    private String bootstrapCode;

    /**
     * Admin signup is gated by a bootstrap code (an env var only you know) — this is deliberate.
     * Platform admins shouldn't be self-service like tenant orgs are; in a real system, existing
     * admins would invite new ones instead of anyone being able to sign up.
     */
    public AdminAuthResponse signup(AdminSignupRequest request) {
        if (!bootstrapCode.equals(request.bootstrapCode())) {
            throw new BadCredentialsException("Invalid bootstrap code");
        }
        if (adminUserRepository.existsByEmail(request.email())) {
            throw new IllegalStateException("An admin with this email already exists");
        }

        AdminUser admin = new AdminUser();
        admin.setEmail(request.email());
        admin.setPasswordHash(passwordEncoder.encode(request.password()));
        admin.setAuthProvider("LOCAL");
        adminUserRepository.save(admin);

        String token = jwtService.generateAdminToken(admin.getEmail());
        return new AdminAuthResponse(token, admin.getEmail());
    }

    public AdminAuthResponse login(AdminLoginRequest request) {
        AdminUser admin = adminUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (admin.getPasswordHash() == null || !passwordEncoder.matches(request.password(), admin.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateAdminToken(admin.getEmail());
        return new AdminAuthResponse(token, admin.getEmail());
    }
}