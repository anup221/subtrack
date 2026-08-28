package com.subtrack.subtrack.webhook;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.NoSuchAlgorithmException;
import java.security.InvalidKeyException;
import java.util.HexFormat;

@Service
public class WebhookSignatureService {

    private static final String ALGORITHM = "HmacSHA256";

    @Value("${webhook.secret}")
    private String secret;

    /** Computes the HMAC-SHA256 signature of a payload — this is what a real gateway (Stripe, etc.) sends as a header. */
    public String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALGORITHM));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Unable to sign webhook payload", e);
        }
    }

    /** Recomputes the expected signature and compares it to what was received — rejects tampered or forged payloads. */
    public boolean verify(String payload, String receivedSignature) {
        String expected = sign(payload);
        return expected.equals(receivedSignature);
    }
}