package com.subtrack.subtrack.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuthFailureHandler implements AuthenticationFailureHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuthFailureHandler.class);

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        String path = request.getRequestURI();
        boolean admin = path.contains("google-admin");

        String target = admin
                ? frontendUrl + "/admin/login"
                : frontendUrl + "/login";

        // Log the real cause so the redirect-uri / client / consent-screen
        // configuration can be diagnosed from the backend console.
        log.warn("Google OAuth login failed for callback {}: {}", path, exception.getMessage(), exception);

        String redirect = UriComponentsBuilder
                .fromUriString(target)
                .queryParam("oauth", "error")
                .build()
                .toUriString();

        response.sendRedirect(redirect);
    }
}