package com.subtrack.subtrack.subscription;

import com.subtrack.subtrack.billing.BillingService;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.billing.InvoiceStatus;
import com.subtrack.subtrack.billing.dto.InvoiceResponse;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.plan.PlanService;
import com.subtrack.subtrack.plan.dto.PlanResponse;
import com.subtrack.subtrack.subscription.dto.AutopayToggleResponse;
import com.subtrack.subtrack.subscription.dto.ChangePlanRequest;
import com.subtrack.subtrack.subscription.dto.ChangePlanResponse;
import com.subtrack.subtrack.subscription.dto.SubscriptionResponse;
import com.subtrack.subtrack.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    public static final UUID FREE_PLAN_ID =
            UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final PlanService planService;
    private final BillingService billingService;
    private final InvoiceRepository invoiceRepository;

    /**
     * Every new organization starts on the Free plan with an ACTIVE
     * subscription. No trial is used — the Free plan is $0 and never
     * generates an invoice, so the org can upgrade to a paid plan at
     * any time by paying the full amount up front.
     */
    public void createFreeSubscription(UUID organizationId) {
        Subscription sub = new Subscription();

        sub.setOrganizationId(organizationId);
        sub.setPlanId(FREE_PLAN_ID);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(
                Instant.now().plus(30, ChronoUnit.DAYS)
        );

        subscriptionRepository.save(sub);
    }

    public SubscriptionResponse getCurrentSubscription() {
        UUID organizationId = TenantContext.get();

        Subscription sub =
                subscriptionRepository
                        .findByOrganizationId(organizationId)
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "No subscription found for this organization"
                                )
                        );

        return toResponse(sub);
    }

    @Transactional
    public ChangePlanResponse changePlan(
            ChangePlanRequest request
    ) {
        UUID organizationId = TenantContext.get();

        Subscription sub =
                subscriptionRepository
                        .findByOrganizationId(organizationId)
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "No subscription found for this organization"
                                )
                        );

        Plan oldPlan =
                planRepository
                        .findById(sub.getPlanId())
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "Current plan not found"
                                )
                        );

        Plan newPlan =
                planRepository
                        .findById(request.planId())
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Plan not found"
                                )
                        );

        if (oldPlan.getId().equals(newPlan.getId())) {
            throw new IllegalArgumentException("This is already your current plan");
        }
        if (sub.getStatus() == SubscriptionStatus.CANCELED) {
            throw new IllegalStateException("A canceled subscription cannot change plans");
        }

        // An unpaid upgrade waiting for Razorpay checkout must be completed
        // (or abandoned) before another paid plan can be selected. A scheduled
        // downgrade (no invoice) can always be replaced by a new selection.
        if (sub.getPendingPlanInvoiceId() != null) {
            throw new IllegalStateException("A plan-change payment is already pending. Complete it before selecting another plan.");
        }

        boolean isUpgrade =
                newPlan.getPriceCents() > oldPlan.getPriceCents();

        if (!isUpgrade) {
            // Downgrade / equal cost / free: never charge now, never apply now.
            // Schedule it to take effect at the next billing cycle.
            sub.setPendingPlanId(newPlan.getId());
            sub.setPendingPlanInvoiceId(null);
            sub.setUpdatedAt(Instant.now());
            subscriptionRepository.save(sub);

            return new ChangePlanResponse(
                    toResponse(sub),
                    null,
                    true
            );
        }

        // Paid upgrade. Free -> paid charges the full price; paid -> paid
        // charges only the prorated difference for the remaining period.
        int amountDueCents =
                calculateUpgradeAmountDueCents(
                        sub,
                        oldPlan,
                        newPlan
                );

        InvoiceResponse upgradeInvoice = null;

        if (amountDueCents > 0) {
            upgradeInvoice = billingService.generateUpgradeInvoice(
                    organizationId, sub.getId(), oldPlan, newPlan,
                    amountDueCents, sub.getCurrentPeriodEnd());
            sub.setPendingPlanId(newPlan.getId());
            sub.setPendingPlanInvoiceId(upgradeInvoice.id());
        } else {
            // Prorated difference is zero (e.g. upgrading right at the end of
            // a period). Apply immediately without creating a $0 invoice.
            sub.setPlanId(newPlan.getId());
            sub.setPendingPlanId(null);
            sub.setPendingPlanInvoiceId(null);
        }

        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        return new ChangePlanResponse(
                toResponse(sub),
                upgradeInvoice
        );
    }

    /**
     * Applies a scheduled downgrade (or a switch to Free) at the next
     * billing cycle. Called by the billing job before generating the
     * next month's invoice. Scheduled plan changes are never charged.
     *
     * Returns true if a scheduled plan was applied.
     */
    @Transactional
    public boolean applyScheduledPlanChange(UUID organizationId) {
        Subscription sub = subscriptionRepository
                .findByOrganizationId(organizationId)
                .orElse(null);

        if (sub == null
                || sub.getPendingPlanId() == null
                || sub.getPendingPlanInvoiceId() != null) {
            return false;
        }

        sub.setPlanId(sub.getPendingPlanId());
        sub.setPendingPlanId(null);
        sub.setPendingPlanInvoiceId(null);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        return true;
    }

    /**
     * Returns how much a paid upgrade costs now.
     *
     * Free plan → any paid plan: full price, no proration.
     *
     * Paid plan → more expensive plan: prorated difference for the
     * days remaining in the current billing period.
     *
     * Downgrades and Free/equal switches are handled by the caller as
     * scheduled changes and never reach this method with a charge.
     */
    private int calculateUpgradeAmountDueCents(
            Subscription sub,
            Plan oldPlan,
            Plan newPlan
    ) {

        if (oldPlan.getPriceCents() == 0) {
            return newPlan.getPriceCents();
        }

        long daysInPeriod =
                Math.max(
                        1,
                        ChronoUnit.DAYS.between(
                                sub.getCurrentPeriodStart(),
                                sub.getCurrentPeriodEnd()
                        )
                );

        long daysRemaining =
                Math.max(
                        0,
                        ChronoUnit.DAYS.between(
                                Instant.now(),
                                sub.getCurrentPeriodEnd()
                        )
                );

        long unusedCreditCents =
                (long) oldPlan.getPriceCents()
                        * daysRemaining
                        / daysInPeriod;

        long proratedNewCostCents =
                (long) newPlan.getPriceCents()
                        * daysRemaining
                        / daysInPeriod;

        long amountDue =
                proratedNewCostCents
                        - unusedCreditCents;

        return (int) Math.max(0, amountDue);
    }

    public SubscriptionResponse cancel() {
        UUID organizationId = TenantContext.get();

        Subscription sub =
                subscriptionRepository
                        .findByOrganizationId(organizationId)
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "No subscription found for this organization"
                                )
                        );

        if (!sub.getStatus().canTransitionTo(
                SubscriptionStatus.CANCELED
        )) {

            throw new IllegalStateException(
                    "Cannot cancel a subscription that is already "
                            + sub.getStatus()
            );
        }

        sub.setStatus(SubscriptionStatus.CANCELED);
        sub.setUpdatedAt(Instant.now());

        subscriptionRepository.save(sub);

        return toResponse(sub);
    }

    /**
     * Cancels an in-progress plan change.
     *
     * If an upgrade invoice was generated but the Razorpay checkout was
     * abandoned, the invoice is voided and the pending plan is cleared so
     * the organization can pick a plan again instead of being stuck.
     * Scheduled downgrades (no invoice) are simply cleared.
     */
    @Transactional
    public SubscriptionResponse cancelPendingPlanChange() {
        UUID organizationId = TenantContext.get();

        Subscription sub = subscriptionRepository
                .findByOrganizationId(organizationId)
                .orElseThrow(
                        () -> new IllegalStateException(
                                "No subscription found for this organization"
                        )
                );

        if (sub.getPendingPlanInvoiceId() != null) {
            invoiceRepository.findById(sub.getPendingPlanInvoiceId())
                    .ifPresent(invoice -> {
                        if (invoice.getStatus() != InvoiceStatus.PAID) {
                            invoice.setStatus(InvoiceStatus.FAILED);
                            invoiceRepository.save(invoice);
                        }
                    });
        }

        sub.setPendingPlanId(null);
        sub.setPendingPlanInvoiceId(null);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        return toResponse(sub);
    }

    /** Called only by the verified payment path, never by plan selection. */
    @Transactional
    public void activatePendingPlanForInvoice(UUID organizationId, UUID invoiceId) {
        Subscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));
        if (!invoiceId.equals(sub.getPendingPlanInvoiceId()) || sub.getPendingPlanId() == null) {
            return; // A recurring invoice must never change the selected plan.
        }
        sub.setPlanId(sub.getPendingPlanId());
        sub.setPendingPlanId(null);
        sub.setPendingPlanInvoiceId(null);
        if (sub.getStatus() == SubscriptionStatus.TRIAL || sub.getStatus() == SubscriptionStatus.PAST_DUE) {
            sub.setStatus(SubscriptionStatus.ACTIVE);
        }
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
    }

    /**
     * Enable or disable autopay for the current organization's
     * subscription.
     *
     * Autopay can only be enabled after a successful Razorpay
     * payment has saved a payment token on the subscription.
     */
    public AutopayToggleResponse setAutopay(
            boolean enabled
    ) {

        UUID organizationId = TenantContext.get();

        Subscription sub =
                subscriptionRepository
                        .findByOrganizationId(organizationId)
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "No subscription found for this organization"
                                )
                        );

        boolean hasPaymentMethod =
                sub.getGatewayPaymentToken() != null;

        if (enabled && !hasPaymentMethod) {

            throw new IllegalStateException(
                    "Pay an invoice via Razorpay first to save a payment method"
            );
        }

        sub.setAutopayEnabled(enabled);

        subscriptionRepository.save(sub);

        return new AutopayToggleResponse(
                sub.isAutopayEnabled(),
                hasPaymentMethod
        );
    }

    private SubscriptionResponse toResponse(
            Subscription sub
    ) {

        Plan plan =
                planRepository
                        .findById(sub.getPlanId())
                        .orElseThrow(
                                () -> new IllegalStateException(
                                        "Plan not found for subscription"
                                )
                        );

        // A pending plan that has no invoice is a downgrade / switch to Free
        // scheduled to take effect at the next billing cycle. A pending plan
        // WITH an invoice is an unpaid upgrade still waiting for payment.
        PlanResponse scheduledPlan = null;
        PlanResponse pendingPlan = null;
        if (sub.getPendingPlanId() != null) {
            PlanResponse pp = planRepository
                    .findById(sub.getPendingPlanId())
                    .map(planService::toResponse)
                    .orElse(null);
            if (sub.getPendingPlanInvoiceId() == null) {
                scheduledPlan = pp;
            } else {
                pendingPlan = pp;
            }
        }

        return new SubscriptionResponse(
                sub.getId(),
                sub.getOrganizationId(),
                planService.toResponse(plan),
                sub.getStatus().name(),
                sub.getCurrentPeriodStart(),
                sub.getCurrentPeriodEnd(),
                sub.getNextBillingDate(),
                sub.isAutopayEnabled(),
                scheduledPlan,
                pendingPlan
        );
    }
}
