package dev.noorahmadi.quakescope.earthquake;

import java.util.List;

import org.springframework.data.domain.Page;

public record EarthquakePageResponse(
        List<EarthquakeResponse> content,
        PageMetadata page) {

    static EarthquakePageResponse from(Page<EarthquakeEvent> events) {
        return new EarthquakePageResponse(
                events.getContent().stream().map(EarthquakeResponse::from).toList(),
                PageMetadata.from(events));
    }
}
