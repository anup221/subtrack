package com.subtrack.subtrack.usage;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UsageAggregationJob {

    private final UsageRecordRepository usageRecordRepository;
    private final UsageDailySummaryRepository usageDailySummaryRepository;

    /** Runs every day at 00:05 — rolls up yesterday's raw usage_record rows into usage_daily_summary. */
    @Scheduled(cron = "0 5 0 * * *")
    public void aggregateYesterday() {
        aggregateForDate(LocalDate.now().minusDays(1));
    }

    /** Extracted so it can be triggered manually too (see UsageController's /aggregate endpoint for testing). */
    public void aggregateForDate(LocalDate date) {
        List<UsageRecordRepository.DailyOrgTotal> totals = usageRecordRepository.sumUsageByOrgForDate(date);

        for (UsageRecordRepository.DailyOrgTotal totalRow : totals) {
            UUID organizationId = totalRow.getOrganizationId();
            int total = totalRow.getTotal().intValue();

            Optional<UsageDailySummary> existing =
                    usageDailySummaryRepository.findByOrganizationIdAndUsageDate(organizationId, date);

            UsageDailySummary summary = existing.orElseGet(UsageDailySummary::new);
            summary.setOrganizationId(organizationId);
            summary.setUsageDate(date);
            summary.setTotalUsage(total);
            usageDailySummaryRepository.save(summary);
        }
    }
}