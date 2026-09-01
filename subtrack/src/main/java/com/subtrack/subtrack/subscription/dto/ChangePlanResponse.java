package com.subtrack.subtrack.subscription.dto;

import com.subtrack.subtrack.billing.dto.InvoiceResponse;

public record ChangePlanResponse(
        SubscriptionResponse subscription,
        InvoiceResponse upgradeInvoice,
        boolean scheduled
) {

    public ChangePlanResponse(
            SubscriptionResponse subscription,
            InvoiceResponse upgradeInvoice
    ) {
        this(subscription, upgradeInvoice, false);
    }
}