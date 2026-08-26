package com.subtrack.subtrack.auth.dto;

public record SignupRequest(
        String organizationName,
        String email,
        String password
) {
}