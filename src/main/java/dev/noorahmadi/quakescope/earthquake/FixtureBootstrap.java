package dev.noorahmadi.quakescope.earthquake;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

@Component
@Profile("fixture")
public class FixtureBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(FixtureBootstrap.class);

    private final EarthquakeIngestionService ingestionService;
    private final Resource fixture;

    public FixtureBootstrap(
            EarthquakeIngestionService ingestionService,
            @Value("${quakescope.fixture.location}") Resource fixture) {
        this.ingestionService = ingestionService;
        this.fixture = fixture;
    }

    @Override
    public void run(ApplicationArguments arguments) {
        IngestionResult result = ingestionService.ingest(fixture);
        LOGGER.info(
                "Fixture ingestion completed: processed={}, inserted={}, updated={}, unchanged={}",
                result.processed(),
                result.inserted(),
                result.updated(),
                result.unchanged());
    }
}
