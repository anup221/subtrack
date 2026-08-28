package com.subtrack.subtrack.payment;

import tools.jackson.databind.ObjectMapper;
import com.subtrack.subtrack.webhook.WebhookSignatureService;
import com.subtrack.subtrack.webhook.dto.WebhookPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MockPaymentGatewayClient {

    private static final String WEBHOOK_URL = "http://localhost:8080/api/webhooks/payment-gateway";
    private static final double SUCCESS_RATE = 0.8; // 80% of charges "succeed" — simulates real-world card declines

    private final RestTemplate restTemplate;
    private final WebhookSignatureService signatureService;
    private final ObjectMapper objectMapper;

    /**
     * Simulates charging a card. In a real integration this would call out to Stripe/Braintree/etc.
     * and the result would arrive later via an actual webhook from their servers. Here, we generate
     * the outcome immediately and deliver it to our own webhook endpoint over real HTTP — so the rest
     * of the system (signature verification, idempotency, event processing) behaves exactly as it would
     * with a genuine third-party gateway.
     */
    public void charge(UUID invoiceId, UUID paymentId, int amountCents) {
        boolean success = Math.random() < SUCCESS_RATE;
        String eventType = success ? "payment.succeeded" : "payment.failed";
        String eventId = UUID.randomUUID().toString();

        WebhookPayload payload = new WebhookPayload(eventId, eventType, invoiceId, paymentId, amountCents);

        try {
            String rawJson = objectMapper.writeValueAsString(payload);
            String signature = signatureService.sign(rawJson);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            headers.set("X-Webhook-Signature", signature);

            HttpEntity<String> request = new HttpEntity<>(rawJson, headers);
            restTemplate.postForEntity(WEBHOOK_URL, request, String.class);
        } catch (Exception e) {
            throw new IllegalStateException("Mock gateway failed to deliver webhook", e);
        }
    }
}