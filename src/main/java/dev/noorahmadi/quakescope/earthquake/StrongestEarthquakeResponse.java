package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

record StrongestEarthquakeResponse(
        String usgsId,
        Double magnitude,
        String place,
        Instant occurredAt) {

    static StrongestEarthquakeResponse from(EarthquakeEvent event) {
        return new StrongestEarthquakeResponse(
                event.getUsgsId(),
                event.getMagnitude(),
                event.getPlace(),
                event.getOccurredAt());
    }
}
