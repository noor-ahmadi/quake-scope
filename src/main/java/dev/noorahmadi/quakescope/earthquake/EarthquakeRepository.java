package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;

public interface EarthquakeRepository extends
        JpaRepository<EarthquakeEvent, String>,
        JpaSpecificationExecutor<EarthquakeEvent> {

    @Modifying
    @Query("delete from EarthquakeEvent event where event.occurredAt < :cutoff")
    int deleteOlderThan(@Param("cutoff") Instant cutoff);
}
