package com.subtrack.subtrack.webhook.dto;

import java.util.UUID;

public record WebhookPayload(
        String eventId,
        String eventType,
        UUID invoiceId,
        UUID paymentId,
        int amountCents
) {
}