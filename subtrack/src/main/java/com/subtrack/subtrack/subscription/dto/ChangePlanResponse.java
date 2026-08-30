package com.subtrack.subtrack.subscription.dto;

import com.subtrack.subtrack.billing.dto.InvoiceResponse;

public record ChangePlanResponse(
        SubscriptionResponse subscription,
        InvoiceResponse upgradeInvoice
) {
}