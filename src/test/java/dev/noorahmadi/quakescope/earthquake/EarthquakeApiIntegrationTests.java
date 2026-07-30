package dev.noorahmadi.quakescope.earthquake;

import dev.noorahmadi.quakescope.TestcontainersConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(TestcontainersConfiguration.class)
@AutoConfigureMockMvc
@SpringBootTest
class EarthquakeApiIntegrationTests {

    private static final ClassPathResource FIXTURE =
            new ClassPathResource("fixtures/usgs/sample-feed.geojson");

    @Autowired
    private EarthquakeIngestionService ingestionService;

    @Autowired
    private EarthquakeRepository repository;

    @Autowired
    private MockMvc mockMvc;

    @BeforeEach
    void resetDatabase() {
        repository.deleteAll();
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
}
