package com.subtrack.subtrack.admin;

import com.subtrack.subtrack.admin.dto.AdminMetricsResponse;
import com.subtrack.subtrack.admin.dto.TenantDetailResponse;
import com.subtrack.subtrack.admin.dto.TenantSummaryResponse;
import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.billing.InvoiceStatus;
import com.subtrack.subtrack.organization.Organization;
import com.subtrack.subtrack.organization.OrganizationRepository;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import com.subtrack.subtrack.user.Role;
import com.subtrack.subtrack.user.User;
import com.subtrack.subtrack.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final OrganizationRepository organizationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    /**
     * Returns platform-wide metrics for the admin dashboard.
     */
    public AdminMetricsResponse getMetrics() {

        List<Subscription> allSubscriptions =
                subscriptionRepository.findAll();

        Map<UUID, Plan> plansById = planRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Plan::getId,
                        plan -> plan
                ));

        int mrrCents = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .mapToInt(s ->
                        plansById
                                .getOrDefault(
                                        s.getPlanId(),
                                        zeroPricePlan()
                                )
                                .getPriceCents()
                )
                .sum();

        long activeCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.ACTIVE)
                .count();

        long canceledCount = allSubscriptions.stream()
                .filter(s -> s.getStatus() == SubscriptionStatus.CANCELED)
                .count();

        double churnRate = allSubscriptions.isEmpty()
                ? 0.0
                : (canceledCount * 100.0)
                / allSubscriptions.size();

        long liveOrgCount = organizationRepository.findAll()
                .stream()
                .filter(org -> !"DELETED".equals(org.getStatus()))
                .count();

        return new AdminMetricsResponse(
                mrrCents,
                (int) liveOrgCount,
                (int) activeCount,
                Math.round(churnRate * 10.0) / 10.0
        );
    }

    /**
     * Returns a summary of every non-deleted organization on the platform.
     *
     * Removed (DELETED) organizations are filtered out so the admin tenant
     * list only shows live workspaces.
     */
    public List<TenantSummaryResponse> listTenants() {

        Map<UUID, Plan> plansById = planRepository.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Plan::getId,
                        plan -> plan
                ));

        Map<UUID, Subscription> subsByOrg =
                subscriptionRepository.findAll()
                        .stream()
                        .collect(Collectors.toMap(
                                Subscription::getOrganizationId,
                                subscription -> subscription
                        ));

        return organizationRepository.findAll()
                .stream()
                .filter(org -> !"DELETED".equals(org.getStatus()))
                .map(org -> {

                    Subscription sub = subsByOrg.get(org.getId());

                    Plan plan = sub != null
                            ? plansById.get(sub.getPlanId())
                            : null;

                    return new TenantSummaryResponse(
                            org.getId(),
                            org.getName(),
                            plan != null
                                    ? plan.getName()
                                    : "—",
                            sub != null
                                    ? sub.getStatus().name()
                                    : "NONE",
                            org.getStatus() != null
                                    ? org.getStatus()
                                    : "ACTIVE",
                            org.getCreatedAt()
                    );
                })
                .toList();
    }

    /**
     * Returns detailed information about one organization.
     *
     * Used by the admin tenant-management view.
     */
    public TenantDetailResponse getTenantDetail(UUID organizationId) {

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Organization not found"
                        )
                );

        /*
         * Find the owner of this organization.
         */
        User owner = userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getOrganizationId().equals(organizationId)
                                && user.getRole() == Role.OWNER
                )
                .findFirst()
                .orElse(null);

        /*
         * Find the current subscription.
         */
        Subscription sub = subscriptionRepository
                .findByOrganizationId(organizationId)
                .orElse(null);

        Plan plan = sub != null
                ? planRepository.findById(sub.getPlanId()).orElse(null)
                : null;

        /*
         * Get invoice history for this organization.
         */
        List<Invoice> invoices =
                invoiceRepository
                        .findByOrganizationIdOrderByCreatedAtDesc(
                                organizationId
                        );

        /*
         * Calculate the amount actually collected.
         *
         * Only PAID invoices contribute to collected revenue.
         */
        int totalCollected = invoices.stream()
                .filter(invoice ->
                        invoice.getStatus() == InvoiceStatus.PAID
                )
                .mapToInt(Invoice::getTotalCents)
                .sum();

        return new TenantDetailResponse(
                org.getId(),
                org.getName(),
                org.getStatus(),
                owner != null
                        ? owner.getEmail()
                        : "—",
                plan != null
                        ? plan.getName()
                        : "—",
                sub != null
                        ? sub.getStatus().name()
                        : "NONE",
                totalCollected,
                invoices.size(),
                org.getCreatedAt()
        );
    }

    /**
     * Changes the organization's status.
     *
     * Examples:
     * ACTIVE
     * DEACTIVATED
     */
    public void setTenantStatus(
            UUID organizationId,
            String status
    ) {

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Organization not found"
                        )
                );

        org.setStatus(status);
        organizationRepository.save(org);
    }

    /**
     * Fallback plan used when a subscription references
     * a missing plan.
     *
     * This prevents admin metrics from crashing.
     */
    private Plan zeroPricePlan() {

        Plan fallback = new Plan();
        fallback.setPriceCents(0);

        return fallback;
    }
}