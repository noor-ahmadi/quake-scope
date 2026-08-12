package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RetentionService {

    private final EarthquakeRepository earthquakeRepository;
    private final IngestionRunRepository runRepository;
    private final RetentionProperties properties;
    private final Clock clock;

    public RetentionService(
            EarthquakeRepository earthquakeRepository,
            IngestionRunRepository runRepository,
            RetentionProperties properties,
            Clock clock) {
        this.earthquakeRepository = earthquakeRepository;
        this.runRepository = runRepository;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public RetentionResult prune() {
        Instant now = clock.instant();
        int deletedEvents = earthquakeRepository.deleteOlderThan(
                now.minus(properties.events()));
        int deletedRuns = runRepository.deleteOlderThan(
                now.minus(properties.ingestionRuns()));
        return new RetentionResult(deletedEvents, deletedRuns);
    }
}
