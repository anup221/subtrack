package com.subtrack.subtrack.admin.dto;

import java.time.Instant;
import java.util.UUID;

public record TenantDetailResponse(
        UUID organizationId,
        String organizationName,
        String status,
        String ownerEmail,
        String planName,
        String subscriptionStatus,
        int totalRevenueCentsCollected,
        int totalInvoices,
        Instant createdAt
) {
}