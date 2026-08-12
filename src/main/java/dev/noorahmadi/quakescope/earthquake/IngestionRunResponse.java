package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

record IngestionRunResponse(
        long id,
        IngestionRunSource source,
        Instant startedAt,
        Instant completedAt,
        Instant rangeStart,
        Instant rangeEnd,
        IngestionRunStatus status,
        int processed,
        int inserted,
        int updated,
        int unchanged,
        String errorMessage) {

    static IngestionRunResponse from(IngestionRun run) {
        return new IngestionRunResponse(
                run.getId(),
                run.getSource(),
                run.getStartedAt(),
                run.getCompletedAt(),
                run.getRangeStart(),
                run.getRangeEnd(),
                run.getStatus(),
                run.getProcessed(),
                run.getInserted(),
                run.getUpdated(),
                run.getUnchanged(),
                run.getErrorMessage());
    }
}
