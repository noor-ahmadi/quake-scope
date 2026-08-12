package dev.noorahmadi.quakescope.earthquake;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "quakescope.retention",
        name = "enabled",
        havingValue = "true")
public class RetentionScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(RetentionScheduler.class);

    private final RetentionService retentionService;

    public RetentionScheduler(RetentionService retentionService) {
        this.retentionService = retentionService;
    }

    @Scheduled(
            fixedDelayString = "${quakescope.retention.fixed-delay}",
            initialDelayString = "${quakescope.retention.initial-delay}")
    public void prune() {
        RetentionResult result = retentionService.prune();
        LOGGER.info(
                "Retention completed: deletedEvents={}, deletedIngestionRuns={}",
                result.deletedEvents(),
                result.deletedIngestionRuns());
    }
}
