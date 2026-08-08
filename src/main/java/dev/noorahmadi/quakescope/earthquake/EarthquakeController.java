package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

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
    private final EarthquakeAnalyticsService analyticsService;

    public EarthquakeController(
            EarthquakeRepository repository,
            EarthquakeAnalyticsService analyticsService) {
        this.repository = repository;
        this.analyticsService = analyticsService;
    }

    @GetMapping
    EarthquakePageResponse list(
            @PageableDefault(
                    size = 20,
                    sort = "occurredAt",
                    direction = Sort.Direction.DESC)
            Pageable pageable,
            @RequestParam(required = false) Double minMagnitude,
            @RequestParam(required = false) Double maxMagnitude,
            @RequestParam(required = false) Instant occurredAfter,
            @RequestParam(required = false) Instant occurredBefore,
            @RequestParam(required = false) Boolean tsunami,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String alert,
            @RequestParam(required = false) String placeContains,
            @RequestParam(required = false) Double minLongitude,
            @RequestParam(required = false) Double maxLongitude,
            @RequestParam(required = false) Double minLatitude,
            @RequestParam(required = false) Double maxLatitude) {
        EarthquakeFilter filter = createFilter(
                minMagnitude,
                maxMagnitude,
                occurredAfter,
                occurredBefore,
                tsunami,
                status,
                alert,
                placeContains,
                minLongitude,
                maxLongitude,
                minLatitude,
                maxLatitude);
        return EarthquakePageResponse.from(
                repository.findAll(filter.specification(), pageable));
    }

    @GetMapping("/summary")
    EarthquakeSummaryResponse summary(
            @RequestParam(required = false) Double minMagnitude,
            @RequestParam(required = false) Double maxMagnitude,
            @RequestParam(required = false) Instant occurredAfter,
            @RequestParam(required = false) Instant occurredBefore,
            @RequestParam(required = false) Boolean tsunami,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String alert,
            @RequestParam(required = false) String placeContains,
            @RequestParam(required = false) Double minLongitude,
            @RequestParam(required = false) Double maxLongitude,
            @RequestParam(required = false) Double minLatitude,
            @RequestParam(required = false) Double maxLatitude) {
        return analyticsService.summarize(createFilter(
                minMagnitude,
                maxMagnitude,
                occurredAfter,
                occurredBefore,
                tsunami,
                status,
                alert,
                placeContains,
                minLongitude,
                maxLongitude,
                minLatitude,
                maxLatitude));
    }

    @GetMapping("/{usgsId}")
    EarthquakeResponse get(@PathVariable String usgsId) {
        return repository.findById(usgsId)
                .map(EarthquakeResponse::from)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Earthquake '" + usgsId + "' was not found"));
    }

    private static EarthquakeFilter createFilter(
            Double minMagnitude,
            Double maxMagnitude,
            Instant occurredAfter,
            Instant occurredBefore,
            Boolean tsunami,
            String status,
            String alert,
            String placeContains,
            Double minLongitude,
            Double maxLongitude,
            Double minLatitude,
            Double maxLatitude) {
        try {
            return new EarthquakeFilter(
                    minMagnitude,
                    maxMagnitude,
                    occurredAfter,
                    occurredBefore,
                    tsunami,
                    status,
                    alert,
                    placeContains,
                    minLongitude,
                    maxLongitude,
                    minLatitude,
                    maxLatitude);
        }
        catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception);
        }
    }
}
