package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.springframework.stereotype.Service;

@Service
public class HistoricalIngestionService {

    private static final Duration WINDOW_SIZE = Duration.ofDays(1);

    private final UsgsFeedClient feedClient;
    private final EarthquakeIngestionService ingestionService;
    private final IngestionRunRecorder runRecorder;
    private final IngestionExecutionGuard executionGuard;
    private final CatchUpProperties properties;
    private final Clock clock;

    public HistoricalIngestionService(
            UsgsFeedClient feedClient,
            EarthquakeIngestionService ingestionService,
            IngestionRunRecorder runRecorder,
            IngestionExecutionGuard executionGuard,
            CatchUpProperties properties,
            Clock clock) {
        this.feedClient = feedClient;
        this.ingestionService = ingestionService;
        this.runRecorder = runRecorder;
        this.executionGuard = executionGuard;
        this.properties = properties;
        this.clock = clock;
    }

    public IngestionResult ingestLookback() {
        Instant end = clock.instant();
        return ingestRange(end.minus(properties.lookback()), end);
    }

    public IngestionResult ingestRange(Instant start, Instant end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("start must not be after end");
        }
        return executionGuard.execute(() -> ingest(start, end));
    }

    private IngestionResult ingest(Instant start, Instant end) {
        long runId = runRecorder.start(
                IngestionRunSource.HISTORICAL,
                clock.instant(),
                start,
                end);
        try {
            IngestionResult result = fetchWindows(start, end);
            runRecorder.succeed(runId, result, clock.instant());
            return result;
        }
        catch (RuntimeException failure) {
            runRecorder.fail(runId, failure, clock.instant());
            throw failure;
        }
    }

    private IngestionResult fetchWindows(Instant start, Instant end) {
        IngestionResult total = IngestionResult.empty();
        Instant windowStart = start;
        while (windowStart.isBefore(end)) {
            Instant windowEnd = minimum(windowStart.plus(WINDOW_SIZE), end);
            total = total.plus(fetchWindow(windowStart, windowEnd));
            windowStart = windowEnd.plusMillis(1);
        }
        return total;
    }

    private IngestionResult fetchWindow(Instant start, Instant end) {
        IngestionResult total = IngestionResult.empty();
        int offset = 1;
        while (true) {
            byte[] page = feedClient.fetchCatalogPage(
                    start,
                    end,
                    properties.pageSize(),
                    offset);
            IngestionResult result = ingestionService.ingest(page);
            total = total.plus(result);
            if (result.processed() < properties.pageSize()) {
                return total;
            }
            offset += properties.pageSize();
        }
    }

    private static Instant minimum(Instant first, Instant second) {
        return first.isBefore(second) ? first : second;
    }
}
