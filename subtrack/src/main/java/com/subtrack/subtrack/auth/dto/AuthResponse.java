package com.subtrack.subtrack.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        String email,
        String role,
        UUID organizationId
) {
}