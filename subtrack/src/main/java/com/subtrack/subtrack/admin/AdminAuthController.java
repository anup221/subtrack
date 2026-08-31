package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminAuthResponse;
import com.subtrack.subtrack.admin.dto.AdminLoginRequest;
import com.subtrack.subtrack.admin.dto.AdminSignupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin-auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/signup")
    public AdminAuthResponse signup(@RequestBody AdminSignupRequest request) {
        return adminAuthService.signup(request);
    }

    @PostMapping("/login")
    public AdminAuthResponse login(@RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }
}