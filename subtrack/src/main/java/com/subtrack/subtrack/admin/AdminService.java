package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminMetricsResponse;
import com.subtrack.subtrack.admin.dto.TenantSummaryResponse;
import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrganizationRepository organizationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;

    public AdminMetricsResponse getMetrics() {
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();
        Map<UUID, Plan> plansById = planRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Plan::getId, p -> p));

        int mrrCents = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .mapToInt(s -> plansById.getOrDefault(s.getPlanId(), zeroPricePlan()).getPriceCents())
                .sum();

        long activeCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .count();

        long canceledCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.CANCELED)
                .count();

        double churnRate = allSubscriptions.isEmpty()
                ? 0.0
                : (canceledCount * 100.0) / allSubscriptions.size();

        return new AdminMetricsResponse(
                mrrCents,
                (int) organizationRepository.count(),
                (int) activeCount,
                Math.round(churnRate * 10.0) / 10.0
        );
    }

    public List<TenantSummaryResponse> listTenants() {
        Map<UUID, Plan> plansById = planRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Plan::getId, p -> p));
        Map<UUID, Subscription> subsByOrg = subscriptionRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(Subscription::getOrganizationId, s -> s));

        return organizationRepository.findAll().stream()
                .map(org -> {
                    Subscription sub = subsByOrg.get(org.getId());
                    Plan plan = sub != null ? plansById.get(sub.getPlanId()) : null;
                    return new TenantSummaryResponse(
                            org.getId(),
                            org.getName(),
                            plan != null ? plan.getName() : "—",
                            sub != null ? sub.getStatus().name() : "NONE",
                            org.getCreatedAt()
                    );
                })
                .toList();
    }

    private Plan zeroPricePlan() {
        Plan fallback = new Plan();
        fallback.setPriceCents(0);
        return fallback;
    }
}