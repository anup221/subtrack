package com.subtrack.subtrack.plan.dto;

public record CreatePlanRequest(
        String name,
        int priceCents,
        int maxUsage,
        String features
) {
}