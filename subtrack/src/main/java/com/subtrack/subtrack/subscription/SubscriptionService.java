package com.subtrack.subtrack.subscription;

import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.plan.PlanService;
import com.subtrack.subtrack.subscription.dto.ChangePlanRequest;
import com.subtrack.subtrack.subscription.dto.SubscriptionResponse;
import com.subtrack.subtrack.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    public static final UUID FREE_PLAN_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final PlanService planService;

    /** Called from AuthService right after a new organization is created. */
    public void createTrialSubscription(UUID organizationId) {
        Subscription sub = new Subscription();
        sub.setOrganizationId(organizationId);
        sub.setPlanId(FREE_PLAN_ID);
        sub.setStatus(SubscriptionStatus.TRIAL);
        sub.setCurrentPeriodStart(Instant.now());
        sub.setCurrentPeriodEnd(Instant.now().plus(30, ChronoUnit.DAYS));
        subscriptionRepository.save(sub);
    }

    public SubscriptionResponse getCurrentSubscription() {
        UUID organizationId = TenantContext.get();
        Subscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));
        return toResponse(sub);
    }

    public SubscriptionResponse changePlan(ChangePlanRequest request) {
        UUID organizationId = TenantContext.get();
        Subscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));

        if (!planRepository.existsById(request.planId())) {
            throw new IllegalArgumentException("Plan not found");
        }

        SubscriptionStatus targetStatus = sub.getStatus() == SubscriptionStatus.TRIAL
                ? SubscriptionStatus.ACTIVE
                : sub.getStatus();

        if (sub.getStatus() != targetStatus && !sub.getStatus().canTransitionTo(targetStatus)) {
            throw new IllegalStateException(
                    "Cannot change plan while subscription is " + sub.getStatus());
        }

        sub.setPlanId(request.planId());
        sub.setStatus(targetStatus);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
        return toResponse(sub);
    }

    public SubscriptionResponse cancel() {
        UUID organizationId = TenantContext.get();
        Subscription sub = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));

        if (!sub.getStatus().canTransitionTo(SubscriptionStatus.CANCELED)) {
            throw new IllegalStateException(
                    "Cannot cancel a subscription that is already " + sub.getStatus());
        }

        sub.setStatus(SubscriptionStatus.CANCELED);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
        return toResponse(sub);
    }

    private SubscriptionResponse toResponse(Subscription sub) {
        Plan plan = planRepository.findById(sub.getPlanId())
                .orElseThrow(() -> new IllegalStateException("Plan not found for subscription"));

        return new SubscriptionResponse(
                sub.getId(),
                sub.getOrganizationId(),
                planService.toResponse(plan),
                sub.getStatus().name(),
                sub.getCurrentPeriodStart(),
                sub.getCurrentPeriodEnd()
        );
    }
}