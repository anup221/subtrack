package com.subtrack.subtrack.subscription.dto;

import com.subtrack.subtrack.plan.dto.PlanResponse;

import java.time.Instant;
import java.util.UUID;

public record SubscriptionResponse(
        UUID id,
        UUID organizationId,
        PlanResponse plan,
        String status,
        Instant currentPeriodStart,
        Instant currentPeriodEnd,
        Instant nextBillingDate,
        boolean autopayEnabled
) {
}