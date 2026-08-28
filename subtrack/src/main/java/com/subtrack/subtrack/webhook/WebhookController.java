package com.subtrack.subtrack.webhook;

import tools.jackson.databind.ObjectMapper;
import com.subtrack.subtrack.webhook.dto.WebhookPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookSignatureService signatureService;
    private final WebhookProcessor webhookProcessor;
    private final ObjectMapper objectMapper;

    @PostMapping(value = "/payment-gateway", consumes = "application/json")
    public ResponseEntity<String> receiveWebhook(
            @RequestBody String rawBody,
            @RequestHeader("X-Webhook-Signature") String signature
    ) throws Exception {

        if (!signatureService.verify(rawBody, signature)) {
            return ResponseEntity.status(401).body("Invalid signature");
        }

        WebhookPayload payload = objectMapper.readValue(rawBody, WebhookPayload.class);
        webhookProcessor.process(payload, rawBody);

        // Always return 200 quickly once verified — this is standard webhook practice.
        // Real gateways retry on anything other than a fast 2xx, which you don't want.
        return ResponseEntity.ok("received");
    }
}