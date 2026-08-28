package com.subtrack.subtrack.webhook;

import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.billing.InvoiceStatus;
import com.subtrack.subtrack.payment.DunningService;
import com.subtrack.subtrack.payment.Payment;
import com.subtrack.subtrack.payment.PaymentRepository;
import com.subtrack.subtrack.payment.PaymentStatus;
import com.subtrack.subtrack.webhook.dto.WebhookPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class WebhookProcessor {

    private final WebhookEventRepository webhookEventRepository;
    private final IdempotencyService idempotencyService;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final DunningService dunningService;

    public void process(WebhookPayload payload, String rawJson) {
        if (idempotencyService.alreadyProcessed(payload.eventId())) {
            // Same event delivered twice (real gateways do this on purpose, to guarantee at-least-once delivery).
            // We've already handled it — do nothing, but don't error either. This IS the idempotency guarantee.
            return;
        }

        WebhookEvent event = new WebhookEvent();
        event.setEventId(payload.eventId());
        event.setEventType(payload.eventType());
        event.setPayload(rawJson);
        event.setProcessedAt(Instant.now());
        webhookEventRepository.save(event);

        Payment payment = paymentRepository.findById(payload.paymentId())
                .orElseThrow(() -> new IllegalStateException("Payment not found for webhook event"));

        Invoice invoice = invoiceRepository.findById(payload.invoiceId())
                .orElseThrow(() -> new IllegalStateException("Invoice not found for webhook event"));

        if ("payment.succeeded".equals(payload.eventType())) {
            payment.setStatus(PaymentStatus.SUCCEEDED);
            payment.setUpdatedAt(Instant.now());
            paymentRepository.save(payment);

            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);

        } else if ("payment.failed".equals(payload.eventType())) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(Instant.now());
            paymentRepository.save(payment);

            invoice.setStatus(InvoiceStatus.FAILED);
            invoiceRepository.save(invoice);

            dunningService.handleFailedPayment(invoice.getId(), payment.getAttemptNumber());
        }
    }
}