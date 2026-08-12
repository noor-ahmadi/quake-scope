package dev.noorahmadi.quakescope.earthquake;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class IngestionRunControllerTests {

    @Test
    void triggersManualLiveFeedRefresh() throws Exception {
        LiveFeedIngestionService ingestionService = mock(LiveFeedIngestionService.class);
        when(ingestionService.ingestLatest(IngestionRunSource.MANUAL))
                .thenReturn(new IngestionResult(8, 3, 1, 4));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new IngestionRunController(
                mock(IngestionRunRepository.class),
                ingestionService)).build();

        mockMvc.perform(post("/api/v1/ingestion-runs/refresh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.processed").value(8))
                .andExpect(jsonPath("$.inserted").value(3))
                .andExpect(jsonPath("$.updated").value(1))
                .andExpect(jsonPath("$.unchanged").value(4));
    }

    @Test
    void rejectsRefreshWhileAnotherIngestionIsRunning() throws Exception {
        LiveFeedIngestionService ingestionService = mock(LiveFeedIngestionService.class);
        when(ingestionService.ingestLatest(IngestionRunSource.MANUAL))
                .thenThrow(new IngestionInProgressException());
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new IngestionRunController(
                mock(IngestionRunRepository.class),
                ingestionService)).build();

        mockMvc.perform(post("/api/v1/ingestion-runs/refresh"))
                .andExpect(status().isConflict());
    }
}
