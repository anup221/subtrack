package com.subtrack.subtrack.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record TenantSummaryResponse(
        UUID organizationId,
        String organizationName,
        String planName,
        String subscriptionStatus,
        String organizationStatus,
        Instant createdAt
) {
}