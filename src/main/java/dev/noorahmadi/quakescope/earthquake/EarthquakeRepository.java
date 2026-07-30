package dev.noorahmadi.quakescope.earthquake;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EarthquakeRepository extends JpaRepository<EarthquakeEvent, String> {
}
