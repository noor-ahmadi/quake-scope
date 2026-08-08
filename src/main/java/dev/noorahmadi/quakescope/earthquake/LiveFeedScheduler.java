package dev.noorahmadi.quakescope.earthquake;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "quakescope.ingestion",
        name = "enabled",
        havingValue = "true")
public class LiveFeedScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(LiveFeedScheduler.class);

    private final LiveFeedIngestionService ingestionService;

    public LiveFeedScheduler(LiveFeedIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Scheduled(
            fixedDelayString = "${quakescope.ingestion.fixed-delay}",
            initialDelayString = "${quakescope.ingestion.initial-delay}")
    public void ingestLatest() {
        try {
            IngestionResult result = ingestionService.ingestLatest();
            LOGGER.info(
                    "USGS ingestion completed: processed={}, inserted={}, updated={}, unchanged={}",
                    result.processed(),
                    result.inserted(),
                    result.updated(),
                    result.unchanged());
        }
        catch (RuntimeException exception) {
            LOGGER.error("USGS ingestion failed", exception);
        }
    }
}
