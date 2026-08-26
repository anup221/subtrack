package com.subtrack.subtrack.auth.dto;

public record LoginRequest(
        String email,
        String password
) {
}