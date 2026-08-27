package com.subtrack.subtrack.usage;

import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.tenant.TenantContext;
import com.subtrack.subtrack.usage.dto.DailyUsagePoint;
import com.subtrack.subtrack.usage.dto.UsageSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class UsageService {

    private static final DateTimeFormatter MONTH_KEY = DateTimeFormatter.ofPattern("yyyyMM");

    private final StringRedisTemplate redisTemplate;
    private final UsageRecordRepository usageRecordRepository;
    private final UsageDailySummaryRepository usageDailySummaryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;

    public void recordUsage(int quantity) {
        UUID organizationId = TenantContext.get();
        int maxUsage = getMaxUsageForOrg(organizationId);

        String redisKey = redisKey(organizationId);
        Long newTotal = redisTemplate.opsForValue().increment(redisKey, quantity);

        if (newTotal != null && newTotal == quantity) {
            // first increment this period — set the key to expire at the end of the current month
            redisTemplate.expire(redisKey, Duration.ofSeconds(secondsUntilMonthEnd()));
        }

        if (newTotal != null && newTotal > maxUsage) {
            // roll back the increment — this call should not count since it's over the limit
            redisTemplate.opsForValue().decrement(redisKey, quantity);
            throw new UsageLimitExceededException(
                    "Usage limit exceeded: " + maxUsage + " calls/month for this plan");
        }

        UsageRecord record = new UsageRecord();
        record.setOrganizationId(organizationId);
        record.setQuantity(quantity);
        usageRecordRepository.save(record);
    }

    public UsageSummaryResponse getUsageSummary() {
        UUID organizationId = TenantContext.get();
        int maxUsage = getMaxUsageForOrg(organizationId);

        String currentValue = redisTemplate.opsForValue().get(redisKey(organizationId));
        int currentPeriodUsage = currentValue != null ? Integer.parseInt(currentValue) : 0;

        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<DailyUsagePoint> breakdown = usageDailySummaryRepository
                .findByOrganizationIdAndUsageDateBetweenOrderByUsageDateAsc(organizationId, start, end)
                .stream()
                .map(s -> new DailyUsagePoint(s.getUsageDate(), s.getTotalUsage()))
                .toList();

        return new UsageSummaryResponse(currentPeriodUsage, maxUsage, breakdown);
    }

    private int getMaxUsageForOrg(UUID organizationId) {
        Subscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));
        Plan plan = planRepository.findById(sub.getPlanId())
                .orElseThrow(() -> new IllegalStateException("Plan not found for subscription"));
        return plan.getMaxUsage();
    }

    private String redisKey(UUID organizationId) {
        return "usage:count:" + organizationId + ":" + YearMonth.now().format(MONTH_KEY);
    }

    private long secondsUntilMonthEnd() {
        LocalDate now = LocalDate.now();
        LocalDate firstOfNextMonth = now.plusMonths(1).withDayOfMonth(1);
        return firstOfNextMonth.atStartOfDay(ZoneOffset.UTC).toEpochSecond()
                - now.atStartOfDay(ZoneOffset.UTC).toEpochSecond();
    }
}