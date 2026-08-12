package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/ingestion-runs")
public class IngestionRunController {

    private final IngestionRunRepository repository;
    private final LiveFeedIngestionService ingestionService;

    public IngestionRunController(
            IngestionRunRepository repository,
            LiveFeedIngestionService ingestionService) {
        this.repository = repository;
        this.ingestionService = ingestionService;
    }

    @GetMapping
    IngestionRunPageResponse list(
            @PageableDefault(
                    size = 20,
                    sort = "startedAt",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return IngestionRunPageResponse.from(repository.findAll(pageable));
    }

    @PostMapping("/refresh")
    IngestionResult refresh() {
        try {
            return ingestionService.ingestLatest(IngestionRunSource.MANUAL);
        }
        catch (IngestionInProgressException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception);
        }
    }
}
