package dev.noorahmadi.quakescope.usgs;

import java.time.Instant;

public record ParsedEarthquake(
        String usgsId,
        Double magnitude,
        String place,
        Instant occurredAt,
        Instant sourceUpdatedAt,
        double longitude,
        double latitude,
        double depthKm,
        String alert,
        String status,
        int significance,
        boolean tsunami,
        String detailUrl,
        String rawJson) {
}
