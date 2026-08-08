package dev.noorahmadi.quakescope.earthquake;

import dev.noorahmadi.quakescope.usgs.UsgsFeedClient;
import org.springframework.stereotype.Service;

@Service
public class LiveFeedIngestionService {

    private final UsgsFeedClient feedClient;
    private final EarthquakeIngestionService ingestionService;

    public LiveFeedIngestionService(
            UsgsFeedClient feedClient,
            EarthquakeIngestionService ingestionService) {
        this.feedClient = feedClient;
        this.ingestionService = ingestionService;
    }

    public IngestionResult ingestLatest() {
        return ingestionService.ingest(feedClient.fetchLatest());
    }
}
