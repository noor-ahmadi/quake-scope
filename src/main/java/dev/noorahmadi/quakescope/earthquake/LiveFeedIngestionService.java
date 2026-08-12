package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.springframework.stereotype.Service;

@Service
public class LiveFeedIngestionService {

    private final UsgsFeedClient feedClient;
    private final EarthquakeIngestionService ingestionService;
    private final IngestionRunRecorder runRecorder;
    private final IngestionExecutionGuard executionGuard;
    private final Clock clock;

    public LiveFeedIngestionService(
            UsgsFeedClient feedClient,
            EarthquakeIngestionService ingestionService,
            IngestionRunRecorder runRecorder,
            IngestionExecutionGuard executionGuard,
            Clock clock) {
        this.feedClient = feedClient;
        this.ingestionService = ingestionService;
        this.runRecorder = runRecorder;
        this.executionGuard = executionGuard;
        this.clock = clock;
    }

    public IngestionResult ingestLatest() {
        return ingestLatest(IngestionRunSource.LIVE_FEED);
    }

    public IngestionResult ingestLatest(IngestionRunSource source) {
        return executionGuard.execute(() -> ingest(source));
    }

    private IngestionResult ingest(IngestionRunSource source) {
        long runId = runRecorder.start(source, clock.instant(), null, null);
        try {
            IngestionResult result = ingestionService.ingest(feedClient.fetchLatest());
            runRecorder.succeed(runId, result, clock.instant());
            return result;
        }
        catch (RuntimeException failure) {
            runRecorder.fail(runId, failure, clock.instant());
            throw failure;
        }
    }
}
