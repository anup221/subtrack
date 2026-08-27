package com.subtrack.subtrack.usage.dto;

import java.util.List;

public record UsageSummaryResponse(
        int currentPeriodUsage,
        int maxUsage,
        List<DailyUsagePoint> dailyBreakdown
) {
}