package com.subtrack.subtrack.billing.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        String status,
        Instant periodStart,
        Instant periodEnd,
        int totalCents,
        List<InvoiceLineItemResponse> lineItems
) {
}