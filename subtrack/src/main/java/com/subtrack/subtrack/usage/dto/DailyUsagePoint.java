package com.subtrack.subtrack.usage.dto;

import java.time.LocalDate;

public record DailyUsagePoint(
        LocalDate date,
        int usage
) {
}