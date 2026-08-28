package com.subtrack.subtrack.payment;

import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.payment.dto.PaymentResponse;
import com.subtrack.subtrack.tenant.TenantContext;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final MockPaymentGatewayClient gatewayClient;
    private final EntityManager entityManager;

    public PaymentResponse initiatePayment(UUID invoiceId) {
        UUID organizationId = TenantContext.get();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new IllegalStateException("Invoice not found");
        }

        int attemptNumber = paymentRepository.countByInvoiceId(invoiceId) + 1;

        Payment payment = new Payment();
        payment.setInvoiceId(invoiceId);
        payment.setOrganizationId(organizationId);
        payment.setAmountCents(invoice.getTotalCents());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAttemptNumber(attemptNumber);
        paymentRepository.save(payment);

        gatewayClient.charge(invoiceId, payment.getId(), invoice.getTotalCents());

        // The webhook call above ran in a separate session and updated the DB directly —
        // clear this session's first-level cache so the next read hits the database
        // instead of returning the stale PENDING copy we already have cached.
        entityManager.clear();

        Payment updated = paymentRepository.findById(payment.getId())
                .orElseThrow(() -> new IllegalStateException("Payment vanished after gateway call"));

        return toResponse(updated);
    }

    public List<PaymentResponse> listPaymentsForInvoice(UUID invoiceId) {
        UUID organizationId = TenantContext.get();

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        if (!invoice.getOrganizationId().equals(organizationId)) {
            throw new IllegalStateException("Invoice not found");
        }

        return paymentRepository.findByInvoiceIdOrderByCreatedAtDesc(invoiceId).stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getInvoiceId(),
                payment.getAmountCents(),
                payment.getStatus().name(),
                payment.getAttemptNumber(),
                payment.getCreatedAt()
        );
    }
}