package com.subtrack.subtrack.usage;

import com.subtrack.subtrack.usage.dto.RecordUsageRequest;
import com.subtrack.subtrack.usage.dto.UsageSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;
    private final UsageAggregationJob usageAggregationJob;

    @PostMapping("/record")
    public UsageSummaryResponse recordUsage(@RequestBody RecordUsageRequest request) {
        usageService.recordUsage(request.quantity());
        return usageService.getUsageSummary();
    }

    @GetMapping("/summary")
    public UsageSummaryResponse getUsageSummary() {
        return usageService.getUsageSummary();
    }

    /** Dev/testing only — manually triggers the daily aggregation job for a given date (defaults to today). */
    @PostMapping("/aggregate")
    public String triggerAggregation(@RequestParam(required = false) String date) {
        LocalDate target = date != null ? LocalDate.parse(date) : LocalDate.now();
        usageAggregationJob.aggregateForDate(target);
        return "Aggregated usage for " + target;
    }
}