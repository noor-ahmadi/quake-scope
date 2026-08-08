package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

record EarthquakeSummaryResponse(
        long totalEvents,
        long eventsWithMagnitude,
        Double averageMagnitude,
        Double maximumMagnitude,
        long tsunamiEvents,
        Double averageDepthKm,
        Instant earliestOccurredAt,
        Instant latestOccurredAt,
        StrongestEarthquakeResponse strongestEarthquake) {
}
