package com.subtrack.subtrack.billing;

import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BillingCycleJob {

    private final SubscriptionRepository subscriptionRepository;
    private final BillingService billingService;

    /** Runs at 01:00 on the 1st of every month — bills every active/trialing org for the prior month. */
    @Scheduled(cron = "0 0 1 1 * *")
    public void runMonthlyBillingCycle() {
        LocalDate end = LocalDate.now().withDayOfMonth(1).minusDays(1);   // last day of previous month
        LocalDate start = end.withDayOfMonth(1);                          // first day of previous month
        runBillingCycleForPeriod(start, end);
    }

    /** Extracted so it's callable manually (see BillingController's /run-cycle endpoint) without waiting a month. */
    public void runBillingCycleForPeriod(LocalDate periodStart, LocalDate periodEnd) {
        List<Subscription> billableSubscriptions = subscriptionRepository.findAll().stream()
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE || sub.getStatus() == SubscriptionStatus.TRIAL)
                .toList();

        for (Subscription sub : billableSubscriptions) {
            billingService.generateInvoiceForOrg(sub.getOrganizationId(), periodStart, periodEnd);
        }
    }
}