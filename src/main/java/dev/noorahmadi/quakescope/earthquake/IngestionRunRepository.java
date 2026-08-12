package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IngestionRunRepository extends JpaRepository<IngestionRun, Long> {

    @Modifying
    @Query("""
            delete from IngestionRun run
            where run.startedAt < :cutoff
              and run.status <> dev.noorahmadi.quakescope.earthquake.IngestionRunStatus.RUNNING
            """)
    int deleteOlderThan(@Param("cutoff") Instant cutoff);
}
