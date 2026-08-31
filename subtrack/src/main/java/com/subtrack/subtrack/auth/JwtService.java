package com.subtrack.subtrack.auth;

import com.subtrack.subtrack.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Generates a JWT for a normal organization user.
     *
     * The token contains:
     * - email
     * - organizationId
     * - role
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim(
                        "organizationId",
                        user.getOrganizationId().toString()
                )
                .claim(
                        "role",
                        user.getRole().name()
                )
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expirationMs
                        )
                )
                .signWith(key())
                .compact();
    }

    /**
     * Generates a JWT for a platform administrator.
     *
     * IMPORTANT:
     * Admin tokens intentionally do NOT contain an
     * organizationId claim.
     *
     * JwtAuthFilter can therefore distinguish:
     *
     * Organization user:
     *   organizationId = present
     *
     * Platform admin:
     *   organizationId = absent
     *   userType = PLATFORM_ADMIN
     */
    public String generateAdminToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim("userType", "PLATFORM_ADMIN")
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expirationMs
                        )
                )
                .signWith(key())
                .compact();
    }

    /**
     * Parses and validates a JWT.
     */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Checks whether a JWT is valid.
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}