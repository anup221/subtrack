package com.subtrack.subtrack.subscription.dto;

public record AutopayToggleResponse(
        boolean autopayEnabled,
        boolean hasPaymentMethodOnFile
) {
}