package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HistoricalIngestionServiceTests {

    private static final Instant NOW = Instant.parse("2026-08-12T16:00:00Z");
    private static final Instant START = Instant.parse("2026-08-12T15:00:00Z");
    private static final byte[] FIRST_PAGE = {1};
    private static final byte[] SECOND_PAGE = {2};

    @Test
    void pagesThroughCatalogAndRecordsCombinedResult() {
        UsgsFeedClient feedClient = mock(UsgsFeedClient.class);
        EarthquakeIngestionService ingestionService = mock(EarthquakeIngestionService.class);
        IngestionRunRecorder runRecorder = mock(IngestionRunRecorder.class);
        when(runRecorder.start(IngestionRunSource.HISTORICAL, NOW, START, NOW))
                .thenReturn(7L);
        when(feedClient.fetchCatalogPage(START, NOW, 2, 1)).thenReturn(FIRST_PAGE);
        when(feedClient.fetchCatalogPage(START, NOW, 2, 3)).thenReturn(SECOND_PAGE);
        when(ingestionService.ingest(FIRST_PAGE))
                .thenReturn(new IngestionResult(2, 2, 0, 0));
        when(ingestionService.ingest(SECOND_PAGE))
                .thenReturn(new IngestionResult(1, 0, 1, 0));
        HistoricalIngestionService service = new HistoricalIngestionService(
                feedClient,
                ingestionService,
                runRecorder,
                new IngestionExecutionGuard(),
                new CatchUpProperties(true, Duration.ofDays(30), 2),
                Clock.fixed(NOW, ZoneOffset.UTC));

        IngestionResult result = service.ingestRange(START, NOW);

        assertThat(result).isEqualTo(new IngestionResult(3, 2, 1, 0));
        verify(runRecorder).succeed(7L, result, NOW);
    }
}
