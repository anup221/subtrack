package com.subtrack.subtrack.payment;

import com.subtrack.subtrack.billing.Invoice;
import com.subtrack.subtrack.billing.InvoiceRepository;
import com.subtrack.subtrack.subscription.Subscription;
import com.subtrack.subtrack.subscription.SubscriptionRepository;
import com.subtrack.subtrack.subscription.SubscriptionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DunningService {

    private static final int MAX_ATTEMPTS_BEFORE_PAST_DUE = 3;

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;

    /** Called after a payment attempt fails. After enough consecutive failures, suspends the subscription. */
    public void handleFailedPayment(UUID invoiceId, int attemptNumber) {
        if (attemptNumber < MAX_ATTEMPTS_BEFORE_PAST_DUE) {
            return; // still within the retry window — no action needed yet
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalStateException("Invoice not found"));

        Subscription subscription = subscriptionRepository.findByOrganizationId(invoice.getOrganizationId())
                .orElseThrow(() -> new IllegalStateException("Subscription not found"));

        if (subscription.getStatus().canTransitionTo(SubscriptionStatus.PAST_DUE)) {
            subscription.setStatus(SubscriptionStatus.PAST_DUE);
            subscription.setUpdatedAt(Instant.now());
            subscriptionRepository.save(subscription);
        }
    }
}