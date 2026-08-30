package com.subtrack.subtrack.payment.dto;

import java.util.UUID;

public record VerifyPaymentRequest(
        UUID invoiceId,
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature
) {
}