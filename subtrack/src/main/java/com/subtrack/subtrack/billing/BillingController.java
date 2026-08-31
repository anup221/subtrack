package com.subtrack.subtrack.billing;

import com.subtrack.subtrack.billing.dto.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final BillingCycleJob billingCycleJob;

    @GetMapping
    public List<InvoiceResponse> listInvoices() {
        return billingService.listInvoicesForCurrentOrg();
    }

    @GetMapping("/{id}")
    public InvoiceResponse getInvoice(@PathVariable UUID id) {
        return billingService.getInvoiceForCurrentOrg(id);
    }

    /** Operational trigger; platform administrators only. */
    @PostMapping("/run-cycle")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public String runCycleNow(
            @RequestParam String periodStart,
            @RequestParam String periodEnd
    ) {
        billingCycleJob.runBillingCycleForPeriod(LocalDate.parse(periodStart), LocalDate.parse(periodEnd));
        return "Billing cycle run for " + periodStart + " to " + periodEnd;
    }
}
