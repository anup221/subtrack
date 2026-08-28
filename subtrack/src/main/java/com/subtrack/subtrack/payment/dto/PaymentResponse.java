package com.subtrack.subtrack.payment.dto;

import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID invoiceId,
        int amountCents,
        String status,
        int attemptNumber,
        Instant createdAt
) {
}