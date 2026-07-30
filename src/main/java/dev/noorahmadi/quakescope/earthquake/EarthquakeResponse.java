package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

public record EarthquakeResponse(
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
        Instant firstSeenAt,
        Instant lastSeenAt) {

    static EarthquakeResponse from(EarthquakeEvent event) {
        return new EarthquakeResponse(
                event.getUsgsId(),
                event.getMagnitude(),
                event.getPlace(),
                event.getOccurredAt(),
                event.getSourceUpdatedAt(),
                event.getLongitude(),
                event.getLatitude(),
                event.getDepthKm(),
                event.getAlert(),
                event.getStatus(),
                event.getSignificance(),
                event.isTsunami(),
                event.getDetailUrl(),
                event.getFirstSeenAt(),
                event.getLastSeenAt());
    }
}
