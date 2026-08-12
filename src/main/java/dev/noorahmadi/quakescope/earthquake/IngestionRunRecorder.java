package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IngestionRunRecorder {

    private static final int MAX_ERROR_LENGTH = 2_000;

    private final IngestionRunRepository repository;

    public IngestionRunRecorder(IngestionRunRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public long start(
            IngestionRunSource source,
            Instant startedAt,
            Instant rangeStart,
            Instant rangeEnd) {
        return repository.save(
                IngestionRun.start(source, startedAt, rangeStart, rangeEnd)).getId();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void succeed(long runId, IngestionResult result, Instant completedAt) {
        IngestionRun run = requireRun(runId);
        run.succeed(result, completedAt);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fail(long runId, RuntimeException failure, Instant completedAt) {
        IngestionRun run = requireRun(runId);
        run.fail(summarize(failure), completedAt);
    }

    private IngestionRun requireRun(long runId) {
        return repository.findById(runId)
                .orElseThrow(() -> new IllegalStateException("Ingestion run " + runId + " was not found"));
    }

    private static String summarize(RuntimeException failure) {
        Throwable root = failure;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String message = root.getMessage();
        String summary = root.getClass().getSimpleName()
                + ((message == null || message.isBlank()) ? "" : ": " + message);
        if (summary.length() <= MAX_ERROR_LENGTH) {
            return summary;
        }
        return summary.substring(0, MAX_ERROR_LENGTH);
    }
}
