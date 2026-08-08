package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface EarthquakeRepository extends
        JpaRepository<EarthquakeEvent, String>,
        JpaSpecificationExecutor<EarthquakeEvent> {
}
