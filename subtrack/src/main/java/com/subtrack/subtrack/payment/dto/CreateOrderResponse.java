package com.subtrack.subtrack.payment.dto;

import java.util.UUID;

public record CreateOrderResponse(
        String razorpayOrderId,
        int amountCents,
        String currency,
        String keyId,
        UUID invoiceId
) {
}