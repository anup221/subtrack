package com.subtrack.subtrack.billing.dto;

public record InvoiceLineItemResponse(
        String description,
        int amountCents,
        Integer quantity
) {
}