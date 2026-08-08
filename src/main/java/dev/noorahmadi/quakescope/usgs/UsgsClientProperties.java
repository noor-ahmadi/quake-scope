package dev.noorahmadi.quakescope.usgs;

import java.net.URI;
import java.time.Duration;
import java.util.Objects;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("quakescope.usgs")
public record UsgsClientProperties(
        URI baseUrl,
        String feedPath,
        Duration requestTimeout,
        int maxAttempts,
        Duration retryBackoff) {

    public UsgsClientProperties {
        Objects.requireNonNull(baseUrl, "baseUrl is required");
        Objects.requireNonNull(feedPath, "feedPath is required");
        Objects.requireNonNull(requestTimeout, "requestTimeout is required");
        Objects.requireNonNull(retryBackoff, "retryBackoff is required");
        if (!baseUrl.isAbsolute()) {
            throw new IllegalArgumentException("baseUrl must be absolute");
        }
        if (feedPath.isBlank() || !feedPath.startsWith("/")) {
            throw new IllegalArgumentException("feedPath must start with '/'");
        }
        if (requestTimeout.isZero() || requestTimeout.isNegative()) {
            throw new IllegalArgumentException("requestTimeout must be positive");
        }
        if (maxAttempts < 1) {
            throw new IllegalArgumentException("maxAttempts must be at least 1");
        }
        if (retryBackoff.isZero() || retryBackoff.isNegative()) {
            throw new IllegalArgumentException("retryBackoff must be positive");
        }
    }
}
