package com.subtrack.subtrack.plan.dto;

import java.util.List;
import java.util.UUID;

public record PlanResponse(
        UUID id,
        String name,
        int priceCents,
        int maxUsage,
        List<String> features
) {
}