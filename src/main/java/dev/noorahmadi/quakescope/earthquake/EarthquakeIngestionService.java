package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import dev.noorahmadi.quakescope.usgs.ParsedEarthquake;
import dev.noorahmadi.quakescope.usgs.UsgsFeedParser;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EarthquakeIngestionService {

    private final EarthquakeRepository repository;
    private final UsgsFeedParser parser;
    private final Clock clock;

    public EarthquakeIngestionService(
            EarthquakeRepository repository,
            UsgsFeedParser parser,
            Clock clock) {
        this.repository = repository;
        this.parser = parser;
        this.clock = clock;
    }

    @Transactional
    public IngestionResult ingest(Resource resource) {
        List<ParsedEarthquake> earthquakes = parser.parse(resource);
        Instant observedAt = clock.instant();
        int inserted = 0;
        int updated = 0;
        int unchanged = 0;

        for (ParsedEarthquake earthquake : earthquakes) {
            EarthquakeEvent existing = repository.findById(earthquake.usgsId()).orElse(null);
            if (existing == null) {
                repository.save(EarthquakeEvent.create(earthquake, observedAt));
                inserted++;
            }
            else if (existing.observe(earthquake, observedAt)) {
                updated++;
            }
            else {
                unchanged++;
            }
        }

        return new IngestionResult(earthquakes.size(), inserted, updated, unchanged);
    }
}
