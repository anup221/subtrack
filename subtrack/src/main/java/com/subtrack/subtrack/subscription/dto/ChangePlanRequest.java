package com.subtrack.subtrack.subscription.dto;

import java.util.UUID;

public record ChangePlanRequest(
        UUID planId
) {
}