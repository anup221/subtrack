package com.subtrack.subtrack.billing;

import com.subtrack.subtrack.billing.dto.InvoiceLineItemResponse;
import com.subtrack.subtrack.billing.dto.InvoiceResponse;
import com.subtrack.subtrack.plan.Plan;
import com.subtrack.subtrack.plan.PlanRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.tenant.TenantContext;
import com.subtrack.subtrack.usage.UsageDailySummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final UsageDailySummaryRepository usageDailySummaryRepository;

    /** Generates one invoice covering [periodStart, periodEnd] for a single organization. */
    public InvoiceResponse generateInvoiceForOrg(UUID organizationId, LocalDate periodStart, LocalDate periodEnd) {
        Subscription subscription = subscriptionRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new IllegalStateException("No subscription found for this organization"));

        Plan plan = planRepository.findById(subscription.getPlanId())
                .orElseThrow(() -> new IllegalStateException("Plan not found for subscription"));

        int usageInPeriod = usageDailySummaryRepository.sumUsageForPeriod(organizationId, periodStart, periodEnd);

        Invoice invoice = new Invoice();
        invoice.setOrganizationId(organizationId);
        invoice.setSubscriptionId(subscription.getId());
        invoice.setStatus(InvoiceStatus.PENDING);
        invoice.setPeriodStart(periodStart.atStartOfDay(ZoneOffset.UTC).toInstant());
        invoice.setPeriodEnd(periodEnd.atStartOfDay(ZoneOffset.UTC).toInstant());
        invoice.setTotalCents(plan.getPriceCents());
        invoiceRepository.save(invoice);

        InvoiceLineItem planFeeLine = new InvoiceLineItem();
        planFeeLine.setInvoiceId(invoice.getId());
        planFeeLine.setDescription(plan.getName() + " Plan — Monthly");
        planFeeLine.setAmountCents(plan.getPriceCents());
        planFeeLine.setQuantity(1);
        invoiceLineItemRepository.save(planFeeLine);

        InvoiceLineItem usageLine = new InvoiceLineItem();
        usageLine.setInvoiceId(invoice.getId());
        usageLine.setDescription("API usage this period (included in plan)");
        usageLine.setAmountCents(0);
        usageLine.setQuantity(usageInPeriod);
        invoiceLineItemRepository.save(usageLine);

        return toResponse(invoice, List.of(planFeeLine, usageLine));
    }

    /** Convenience for manual/testing use — generates an invoice for the calling user's own org, last 30 days. */
    public InvoiceResponse generateInvoiceForCurrentOrg() {
        UUID organizationId = TenantContext.get();
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(30);
        return generateInvoiceForOrg(organizationId, start, end);
    }

    public List<InvoiceResponse> listInvoicesForCurrentOrg() {
        UUID organizationId = TenantContext.get();
        return invoiceRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId).stream()
                .map(invoice -> toResponse(invoice, invoiceLineItemRepository.findByInvoiceId(invoice.getId())))
                .toList();
    }

    public InvoiceResponse getInvoiceForCurrentOrg(UUID invoiceId) {
        UUID organizationId = TenantContext.get();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new IllegalStateException("Invoice not found");
        }

        return toResponse(invoice, invoiceLineItemRepository.findByInvoiceId(invoice.getId()));
    }

    private InvoiceResponse toResponse(Invoice invoice, List<InvoiceLineItem> lineItems) {
        List<InvoiceLineItemResponse> lineItemResponses = lineItems.stream()
                .map(li -> new InvoiceLineItemResponse(li.getDescription(), li.getAmountCents(), li.getQuantity()))
                .toList();

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getStatus().name(),
                invoice.getPeriodStart(),
                invoice.getPeriodEnd(),
                invoice.getTotalCents(),
                lineItemResponses
        );
    }
}