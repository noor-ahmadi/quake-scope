package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
            Pageable pageable,
            @RequestParam(required = false) Double minMagnitude) {
        if (minMagnitude == null) {
            return EarthquakePageResponse.from(repository.findAll(pageable));
        }
        return EarthquakePageResponse.from(
                repository.findByMagnitudeGreaterThanEqual(minMagnitude, pageable));
    }

    @GetMapping("/{usgsId}")
    EarthquakeResponse get(@PathVariable String usgsId) {
        return repository.findById(usgsId)
                .map(EarthquakeResponse::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Earthquake '" + usgsId + "' was not found"));
    }
}
