package com.subtrack.subtrack.subscription;

import com.subtrack.subtrack.billing.BillingService;
import com.subtrack.subtrack.billing.dto.InvoiceResponse;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.plan.PlanService;
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

    public void createTrialSubscription(UUID organizationId) {
        Subscription sub = new Subscription();

        sub.setOrganizationId(organizationId);
        sub.setPlanId(FREE_PLAN_ID);
        sub.setStatus(SubscriptionStatus.TRIAL);
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
        if (sub.getPendingPlanInvoiceId() != null) {
            throw new IllegalStateException("A plan-change payment is already pending. Complete it before selecting another plan.");
        }

        int amountDueCents =
                calculateAmountDueCents(
                        sub,
                        oldPlan,
                        newPlan
                );

        // A downgrade (and a switch to Free) has no charge and is safe to apply
        // immediately.  A paid upgrade is deliberately only staged here.
        InvoiceResponse upgradeInvoice = null;
        if (amountDueCents == 0) {
            sub.setPlanId(newPlan.getId());
            sub.setPendingPlanId(null);
            sub.setPendingPlanInvoiceId(null);
        } else {
            upgradeInvoice = billingService.generateUpgradeInvoice(
                    organizationId, sub.getId(), oldPlan, newPlan,
                    amountDueCents, sub.getCurrentPeriodEnd());
            sub.setPendingPlanId(newPlan.getId());
            sub.setPendingPlanInvoiceId(upgradeInvoice.id());
        }
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);

        return new ChangePlanResponse(
                toResponse(sub),
                upgradeInvoice
        );
    }

    /**
     * Free plan → any paid plan:
     * full price, no proration.
     *
     * Paid plan → cheaper or equal plan:
     * $0 due now.
     *
     * Paid plan → more expensive plan:
     * prorated difference for the days remaining
     * in the current billing period.
     */
    private int calculateAmountDueCents(
            Subscription sub,
            Plan oldPlan,
            Plan newPlan
    ) {

        if (oldPlan.getPriceCents() == 0) {
            return newPlan.getPriceCents();
        }

        if (newPlan.getPriceCents()
                <= oldPlan.getPriceCents()) {

            return 0;
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

        return new SubscriptionResponse(
                sub.getId(),
                sub.getOrganizationId(),
                planService.toResponse(plan),
                sub.getStatus().name(),
                sub.getCurrentPeriodStart(),
                sub.getCurrentPeriodEnd(),
                sub.getNextBillingDate(),
                sub.isAutopayEnabled()
        );
    }
}
