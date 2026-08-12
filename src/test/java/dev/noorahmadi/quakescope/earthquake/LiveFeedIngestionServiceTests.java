package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LiveFeedIngestionServiceTests {

    private static final Instant NOW = Instant.parse("2026-08-08T20:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);

    @Test
    void fetchesAndIngestsLatestFeed() {
        byte[] feed = {1, 2, 3};
        IngestionResult expected = new IngestionResult(3, 2, 1, 0);
        UsgsFeedClient feedClient = mock(UsgsFeedClient.class);
        EarthquakeIngestionService ingestionService = mock(EarthquakeIngestionService.class);
        IngestionRunRecorder runRecorder = mock(IngestionRunRecorder.class);
        when(runRecorder.start(IngestionRunSource.LIVE_FEED, NOW, null, null)).thenReturn(42L);
        when(feedClient.fetchLatest()).thenReturn(feed);
        when(ingestionService.ingest(feed)).thenReturn(expected);

        LiveFeedIngestionService liveIngestion =
                new LiveFeedIngestionService(
                        feedClient,
                        ingestionService,
                        runRecorder,
                        new IngestionExecutionGuard(),
                        CLOCK);

        assertThat(liveIngestion.ingestLatest()).isEqualTo(expected);
        verify(ingestionService).ingest(feed);
        verify(runRecorder).succeed(42L, expected, NOW);
    }

    @Test
    void recordsFailedRunsBeforePropagatingFailure() {
        RuntimeException failure = new RuntimeException("upstream unavailable");
        UsgsFeedClient feedClient = mock(UsgsFeedClient.class);
        EarthquakeIngestionService ingestionService = mock(EarthquakeIngestionService.class);
        IngestionRunRecorder runRecorder = mock(IngestionRunRecorder.class);
        when(runRecorder.start(IngestionRunSource.LIVE_FEED, NOW, null, null)).thenReturn(43L);
        when(feedClient.fetchLatest()).thenThrow(failure);

        LiveFeedIngestionService liveIngestion =
                new LiveFeedIngestionService(
                        feedClient,
                        ingestionService,
                        runRecorder,
                        new IngestionExecutionGuard(),
                        CLOCK);

        assertThatThrownBy(liveIngestion::ingestLatest).isSameAs(failure);
        verify(runRecorder).fail(43L, failure, NOW);
    }
}
