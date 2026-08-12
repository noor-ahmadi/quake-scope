package dev.noorahmadi.quakescope.earthquake;

import java.time.Duration;
import java.util.Objects;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("quakescope.ingestion.catch-up")
public record CatchUpProperties(
        boolean enabled,
        Duration lookback,
        int pageSize) {

    public CatchUpProperties {
        Objects.requireNonNull(lookback, "lookback is required");
        if (lookback.isZero() || lookback.isNegative()) {
            throw new IllegalArgumentException("lookback must be positive");
        }
        if (pageSize < 1 || pageSize > 20_000) {
            throw new IllegalArgumentException("pageSize must be between 1 and 20000");
        }
    }
}
