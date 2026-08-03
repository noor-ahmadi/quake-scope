package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EarthquakeRepository extends JpaRepository<EarthquakeEvent, String> {

    Page<EarthquakeEvent> findByMagnitudeGreaterThanEqual(
            double minMagnitude,
            Pageable pageable);
}
