package dev.noorahmadi.quakescope.earthquake;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "quakescope.ingestion.catch-up",
        name = "enabled",
        havingValue = "true")
public class HistoricalIngestionScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(HistoricalIngestionScheduler.class);

    private final HistoricalIngestionService ingestionService;

    public HistoricalIngestionScheduler(HistoricalIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Scheduled(
            fixedDelayString = "${quakescope.ingestion.catch-up.fixed-delay}",
            initialDelayString = "${quakescope.ingestion.catch-up.initial-delay}")
    public void catchUp() {
        try {
            IngestionResult result = ingestionService.ingestLookback();
            LOGGER.info(
                    "USGS catch-up completed: processed={}, inserted={}, updated={}, unchanged={}",
                    result.processed(),
                    result.inserted(),
                    result.updated(),
                    result.unchanged());
        }
        catch (IngestionInProgressException exception) {
            LOGGER.info("Skipping USGS catch-up because another ingestion is in progress");
        }
        catch (RuntimeException exception) {
            LOGGER.error("USGS catch-up failed", exception);
        }
    }
}
