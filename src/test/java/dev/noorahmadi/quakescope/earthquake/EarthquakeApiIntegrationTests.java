package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

import dev.noorahmadi.quakescope.TestcontainersConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
@SpringBootTest(properties = {
        "quakescope.ingestion.enabled=false",
        "quakescope.ingestion.catch-up.enabled=false",
        "quakescope.retention.enabled=false"
})
class EarthquakeApiIntegrationTests {

    private static final ClassPathResource FIXTURE =
            new ClassPathResource("fixtures/usgs/sample-feed.geojson");

    @Autowired
    private EarthquakeIngestionService ingestionService;

    @Autowired
    private EarthquakeRepository repository;

    @Autowired
    private IngestionRunRepository runRepository;

    @Autowired
    private IngestionRunRecorder runRecorder;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void resetDatabase() {
        repository.deleteAll();
        runRepository.deleteAll();
    }

    @Test
    void persistsFixtureAndReturnsExplicitPageMetadata() throws Exception {
        IngestionResult result = ingestionService.ingest(FIXTURE);

        assertThat(result).isEqualTo(new IngestionResult(3, 3, 0, 0));

        mockMvc.perform(get("/api/v1/earthquakes")
                        .queryParam("page", "0")
                        .queryParam("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].usgsId").value("qs-demo-001"))
                .andExpect(jsonPath("$.content[1].usgsId").value("qs-demo-002"))
                .andExpect(jsonPath("$.page.page").value(0))
                .andExpect(jsonPath("$.page.size").value(2))
                .andExpect(jsonPath("$.page.totalElements").value(3))
                .andExpect(jsonPath("$.page.totalPages").value(2))
                .andExpect(jsonPath("$.page.first").value(true))
                .andExpect(jsonPath("$.page.last").value(false));
    }

    @Test
    void repeatedIngestionDoesNotCreateDuplicates() {
        ingestionService.ingest(FIXTURE);

        IngestionResult repeated = ingestionService.ingest(FIXTURE);

        assertThat(repeated).isEqualTo(new IngestionResult(3, 0, 0, 3));
        assertThat(repository.count()).isEqualTo(3);
    }

    @Test
    void filtersEarthquakesByMinimumMagnitude() throws Exception {
        ingestionService.ingest(FIXTURE);

        mockMvc.perform(get("/api/v1/earthquakes")
                        .queryParam("minMagnitude", "4.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].usgsId").value("qs-demo-002"))
                .andExpect(jsonPath("$.content[0].magnitude").value(5.1))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void combinesTimeLocationAndEventFilters() throws Exception {
        ingestionService.ingest(FIXTURE);

        mockMvc.perform(get("/api/v1/earthquakes")
                        .queryParam("minMagnitude", "3.0")
                        .queryParam("maxMagnitude", "4.0")
                        .queryParam("occurredAfter", "2026-07-30T18:30:00Z")
                        .queryParam("occurredBefore", "2026-07-30T19:00:00Z")
                        .queryParam("tsunami", "false")
                        .queryParam("status", "REVIEWED")
                        .queryParam("alert", "Green")
                        .queryParam("placeContains", "geysers")
                        .queryParam("minLongitude", "-130")
                        .queryParam("maxLongitude", "-120")
                        .queryParam("minLatitude", "30")
                        .queryParam("maxLatitude", "45"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].usgsId").value("qs-demo-001"))
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }

    @Test
    void returnsProblemDetailForInvalidFilterRange() throws Exception {
        mockMvc.perform(get("/api/v1/earthquakes")
                        .queryParam("minLatitude", "45")
                        .queryParam("maxLatitude", "30"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.detail")
                        .value("minLatitude must be less than or equal to maxLatitude"));
    }

    @Test
    void summarizesMatchingEarthquakesInTheDatabase() throws Exception {
        ingestionService.ingest(FIXTURE);

        mockMvc.perform(get("/api/v1/earthquakes/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvents").value(3))
                .andExpect(jsonPath("$.eventsWithMagnitude").value(2))
                .andExpect(jsonPath("$.averageMagnitude").value(4.15))
                .andExpect(jsonPath("$.maximumMagnitude").value(5.1))
                .andExpect(jsonPath("$.tsunamiEvents").value(1))
                .andExpect(jsonPath("$.averageDepthKm").value(18.4))
                .andExpect(jsonPath("$.earliestOccurredAt")
                        .value("2026-07-30T17:00:00Z"))
                .andExpect(jsonPath("$.latestOccurredAt")
                        .value("2026-07-30T19:00:00Z"))
                .andExpect(jsonPath("$.strongestEarthquake.usgsId")
                        .value("qs-demo-002"))
                .andExpect(jsonPath("$.strongestEarthquake.magnitude").value(5.1));
    }

    @Test
    void appliesFiltersToEarthquakeSummary() throws Exception {
        ingestionService.ingest(FIXTURE);

        mockMvc.perform(get("/api/v1/earthquakes/summary")
                        .queryParam("maxMagnitude", "4.0")
                        .queryParam("status", "reviewed"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvents").value(1))
                .andExpect(jsonPath("$.averageMagnitude").value(3.2))
                .andExpect(jsonPath("$.tsunamiEvents").value(0))
                .andExpect(jsonPath("$.strongestEarthquake.usgsId")
                        .value("qs-demo-001"));
    }

    @Test
    void returnsEmptySummaryWhenNoEarthquakesMatch() throws Exception {
        mockMvc.perform(get("/api/v1/earthquakes/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalEvents").value(0))
                .andExpect(jsonPath("$.eventsWithMagnitude").value(0))
                .andExpect(jsonPath("$.tsunamiEvents").value(0))
                .andExpect(jsonPath("$.averageMagnitude").doesNotExist())
                .andExpect(jsonPath("$.strongestEarthquake").doesNotExist());
    }

    @Test
    void returnsEarthquakeDetailsByUsgsId() throws Exception {
        ingestionService.ingest(FIXTURE);

        mockMvc.perform(get("/api/v1/earthquakes/qs-demo-002"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usgsId").value("qs-demo-002"))
                .andExpect(jsonPath("$.magnitude").value(5.1))
                .andExpect(jsonPath("$.place").value("90 km SE of Sand Point, Alaska"))
                .andExpect(jsonPath("$.tsunami").value(true))
                .andExpect(jsonPath("$.status").value("automatic"));
    }

    @Test
    void returnsProblemDetailWhenEarthquakeDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/v1/earthquakes/missing-event"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.title").value("Not Found"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.detail")
                        .value("Earthquake 'missing-event' was not found"))
                .andExpect(jsonPath("$.instance")
                        .value("/api/v1/earthquakes/missing-event"));
    }

    @Test
    void returnsNewestIngestionRunsWithOutcomes() throws Exception {
        Instant successfulStartedAt = Instant.parse("2026-08-08T19:58:00Z");
        long successfulRun = runRecorder.start(
                IngestionRunSource.HISTORICAL,
                successfulStartedAt,
                Instant.parse("2026-08-01T00:00:00Z"),
                Instant.parse("2026-08-08T00:00:00Z"));
        runRecorder.succeed(
                successfulRun,
                new IngestionResult(3, 2, 1, 0),
                Instant.parse("2026-08-08T19:58:02Z"));
        long failedRun = runRecorder.start(
                IngestionRunSource.LIVE_FEED,
                Instant.parse("2026-08-08T19:59:00Z"),
                null,
                null);
        runRecorder.fail(
                failedRun,
                new IllegalStateException("feed was unavailable"),
                Instant.parse("2026-08-08T19:59:01Z"));

        mockMvc.perform(get("/api/v1/ingestion-runs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(failedRun))
                .andExpect(jsonPath("$.content[0].source").value("LIVE_FEED"))
                .andExpect(jsonPath("$.content[0].status").value("FAILED"))
                .andExpect(jsonPath("$.content[0].errorMessage")
                        .value("IllegalStateException: feed was unavailable"))
                .andExpect(jsonPath("$.content[1].id").value(successfulRun))
                .andExpect(jsonPath("$.content[1].source").value("HISTORICAL"))
                .andExpect(jsonPath("$.content[1].rangeStart")
                        .value("2026-08-01T00:00:00Z"))
                .andExpect(jsonPath("$.content[1].status").value("SUCCEEDED"))
                .andExpect(jsonPath("$.content[1].processed").value(3))
                .andExpect(jsonPath("$.content[1].inserted").value(2))
                .andExpect(jsonPath("$.content[1].updated").value(1))
                .andExpect(jsonPath("$.page.totalElements").value(2));
    }
}
