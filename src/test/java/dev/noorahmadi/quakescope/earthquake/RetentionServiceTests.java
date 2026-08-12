package dev.noorahmadi.quakescope.earthquake;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RetentionServiceTests {

    @Test
    void prunesEventsAndRunsAtIndependentCutoffs() {
        Instant now = Instant.parse("2026-08-12T16:00:00Z");
        EarthquakeRepository earthquakeRepository = mock(EarthquakeRepository.class);
        IngestionRunRepository runRepository = mock(IngestionRunRepository.class);
        when(earthquakeRepository.deleteOlderThan(now.minus(Duration.ofDays(90))))
                .thenReturn(12);
        when(runRepository.deleteOlderThan(now.minus(Duration.ofDays(30))))
                .thenReturn(4);
        RetentionService service = new RetentionService(
                earthquakeRepository,
                runRepository,
                new RetentionProperties(true, Duration.ofDays(90), Duration.ofDays(30)),
                Clock.fixed(now, ZoneOffset.UTC));

        RetentionResult result = service.prune();

        assertThat(result).isEqualTo(new RetentionResult(12, 4));
        verify(earthquakeRepository).deleteOlderThan(now.minus(Duration.ofDays(90)));
        verify(runRepository).deleteOlderThan(now.minus(Duration.ofDays(30)));
    }
}
