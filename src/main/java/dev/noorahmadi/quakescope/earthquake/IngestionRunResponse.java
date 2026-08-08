package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

record IngestionRunResponse(
        long id,
        Instant startedAt,
        Instant completedAt,
        IngestionRunStatus status,
        int processed,
        int inserted,
        int updated,
        int unchanged,
        String errorMessage) {

    static IngestionRunResponse from(IngestionRun run) {
        return new IngestionRunResponse(
                run.getId(),
                run.getStartedAt(),
                run.getCompletedAt(),
                run.getStatus(),
                run.getProcessed(),
                run.getInserted(),
                run.getUpdated(),
                run.getUnchanged(),
                run.getErrorMessage());
    }
}
