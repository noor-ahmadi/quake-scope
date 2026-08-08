package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ingestion-runs")
public class IngestionRunController {

    private final IngestionRunRepository repository;

    public IngestionRunController(IngestionRunRepository repository) {
        this.repository = repository;
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
}
