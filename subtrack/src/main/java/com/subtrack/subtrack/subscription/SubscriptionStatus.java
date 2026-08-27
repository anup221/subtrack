package com.subtrack.subtrack.subscription;

import java.util.Map;
import java.util.Set;

public enum SubscriptionStatus {
    TRIAL,
    ACTIVE,
    PAST_DUE,
    CANCELED;

    private static final Map<SubscriptionStatus, Set<SubscriptionStatus>> ALLOWED_TRANSITIONS = Map.of(
            TRIAL, Set.of(ACTIVE, CANCELED),
            ACTIVE, Set.of(PAST_DUE, CANCELED),
            PAST_DUE, Set.of(ACTIVE, CANCELED),
            CANCELED, Set.of()
    );

    public boolean canTransitionTo(SubscriptionStatus target) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }
}