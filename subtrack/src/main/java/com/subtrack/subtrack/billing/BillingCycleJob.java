package com.subtrack.subtrack.billing;

import com.subtrack.subtrack.payment.AutopayService;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BillingCycleJob {

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final BillingService billingService;
    private final AutopayService autopayService;

    /**
     * Runs daily at 01:00.
     *
     * Bills any subscription whose billing month
     * hasn't been invoiced yet.
     */
    @Scheduled(cron = "0 0 1 * * *")
    public void runDailyBillingCheck() {
        LocalDate currentMonth = LocalDate.now().withDayOfMonth(1);

        List<Subscription> billableSubscriptions =
                subscriptionRepository.findAll().stream()
                        .filter(sub ->
                                sub.getStatus() == SubscriptionStatus.ACTIVE
                                        || sub.getStatus() == SubscriptionStatus.TRIAL
                        )
                        .toList();

        for (Subscription sub : billableSubscriptions) {
            billOrganizationForMonth(sub, currentMonth);
        }
    }

    /**
     * Public manual/test trigger for a billing period.
     *
     * The actual billing logic remains centralized in
     * billOrganizationForMonth() so that duplicate protection,
     * free-plan handling, invoice generation, and autopay
     * behavior remain unchanged.
     *
     * periodEnd is accepted by the controller for testing,
     * but billing is performed for the month represented by
     * periodStart.
     */
    public void runBillingCycleForPeriod(
            LocalDate periodStart,
            LocalDate periodEnd
    ) {
        LocalDate billingMonth = periodStart.withDayOfMonth(1);

        List<Subscription> billableSubscriptions =
                subscriptionRepository.findAll().stream()
                        .filter(sub ->
                                sub.getStatus() == SubscriptionStatus.ACTIVE
                                        || sub.getStatus() == SubscriptionStatus.TRIAL
                        )
                        .toList();

        for (Subscription sub : billableSubscriptions) {
            billOrganizationForMonth(sub, billingMonth);
        }
    }

    /**
     * Bills one organization for one billing month.
     *
     * The database UNIQUE(organization_id, billing_month)
     * constraint remains the final duplicate-billing guarantee.
     */
    public void billOrganizationForMonth(
            Subscription sub,
            LocalDate billingMonth
    ) {
        // The UNIQUE(organization_id, billing_month) constraint
        // is the real guarantee here. This check avoids an
        // unnecessary failed insert in the common case.
        Optional<BillingCycle> existing =
                billingCycleRepository.findByOrganizationIdAndBillingMonth(
                        sub.getOrganizationId(),
                        billingMonth
                );

        if (existing.isPresent()) {
            return;
        }

        Plan plan = planRepository.findById(sub.getPlanId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Plan not found for subscription"
                        )
                );

        BillingCycle cycle = new BillingCycle();

        cycle.setOrganizationId(sub.getOrganizationId());
        cycle.setSubscriptionId(sub.getId());
        cycle.setBillingMonth(billingMonth);

        /*
         * Free plan:
         *
         * Never generate a $0 invoice.
         * Only record that the billing cycle was intentionally skipped.
         */
        if (plan.getPriceCents() == 0) {
            cycle.setStatus(BillingCycleStatus.SKIPPED_FREE_PLAN);
            saveBillingCycle(cycle);
            return;
        }

        /*
         * Paid plan:
         *
         * Generate the invoice for the billing period.
         */
        LocalDate periodStart = billingMonth;
        LocalDate periodEnd =
                billingMonth.plusMonths(1).minusDays(1);

        var invoice = billingService.generateInvoiceForOrg(
                sub.getOrganizationId(),
                periodStart,
                periodEnd
        );

        cycle.setInvoiceId(invoice.id());
        cycle.setStatus(BillingCycleStatus.PENDING_PAYMENT);

        saveBillingCycle(cycle);

        /*
         * Advance next billing date regardless of autopay.
         * This represents when the next charge is due.
         */
        sub.setNextBillingDate(
                billingMonth
                        .plusMonths(1)
                        .atStartOfDay(java.time.ZoneOffset.UTC)
                        .toInstant()
        );

        subscriptionRepository.save(sub);

        /*
         * Attempt automatic payment only when:
         *
         * 1. Autopay is enabled
         * 2. A Razorpay payment token exists
         */
        if (sub.isAutopayEnabled()
                && sub.getGatewayPaymentToken() != null) {

            autopayService.attemptAutopayCharge(
                    sub,
                    invoice.id(),
                    invoice.totalCents()
            );
        }
    }

    /**
     * Saves the billing cycle.
     *
     * If another request/process inserted the same
     * organization + billing month concurrently, the
     * database uniqueness constraint catches it.
     */
    private void saveBillingCycle(BillingCycle cycle) {
        try {
            billingCycleRepository.save(cycle);
        } catch (DataIntegrityViolationException e) {
            // Another concurrent request already inserted
            // this organization + month.
            //
            // Safe to ignore because the database constraint
            // is the final duplicate-billing guarantee.
        }
    }
}