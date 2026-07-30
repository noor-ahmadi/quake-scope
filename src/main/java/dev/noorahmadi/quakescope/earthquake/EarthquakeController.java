package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/earthquakes")
public class EarthquakeController {

    private final EarthquakeRepository repository;

    public EarthquakeController(EarthquakeRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    EarthquakePageResponse list(
            @PageableDefault(
                    size = 20,
                    sort = "occurredAt",
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return EarthquakePageResponse.from(repository.findAll(pageable));
    }
}
