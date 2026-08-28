package com.subtrack.subtrack.admin.dto;

public record AdminMetricsResponse(
        int mrrCents,
        int totalOrganizations,
        int activeSubscriptions,
        double churnRatePercent
) {
}