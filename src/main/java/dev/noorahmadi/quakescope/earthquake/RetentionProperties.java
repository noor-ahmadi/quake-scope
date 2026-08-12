package dev.noorahmadi.quakescope.earthquake;

import java.time.Duration;
import java.util.Objects;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("quakescope.retention")
public record RetentionProperties(
        boolean enabled,
        Duration events,
        Duration ingestionRuns) {

    public RetentionProperties {
        Objects.requireNonNull(events, "events retention is required");
        Objects.requireNonNull(ingestionRuns, "ingestionRuns retention is required");
        if (events.isZero() || events.isNegative()) {
            throw new IllegalArgumentException("events retention must be positive");
        }
        if (ingestionRuns.isZero() || ingestionRuns.isNegative()) {
            throw new IllegalArgumentException("ingestionRuns retention must be positive");
        }
    }
}
