package dev.noorahmadi.quakescope.earthquake;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LiveFeedIngestionServiceTests {

    @Test
    void fetchesAndIngestsLatestFeed() {
        byte[] feed = {1, 2, 3};
        IngestionResult expected = new IngestionResult(3, 2, 1, 0);
        UsgsFeedClient feedClient = mock(UsgsFeedClient.class);
        EarthquakeIngestionService ingestionService = mock(EarthquakeIngestionService.class);
        when(feedClient.fetchLatest()).thenReturn(feed);
        when(ingestionService.ingest(feed)).thenReturn(expected);

        LiveFeedIngestionService liveIngestion =
                new LiveFeedIngestionService(feedClient, ingestionService);

        assertThat(liveIngestion.ingestLatest()).isEqualTo(expected);
        verify(ingestionService).ingest(feed);
    }
}
