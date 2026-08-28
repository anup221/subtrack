package com.subtrack.subtrack.webhook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final WebhookEventRepository webhookEventRepository;

    public boolean alreadyProcessed(String eventId) {
        return webhookEventRepository.existsByEventId(eventId);
    }
}