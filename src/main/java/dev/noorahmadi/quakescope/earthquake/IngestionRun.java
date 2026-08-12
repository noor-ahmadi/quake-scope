package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ingestion_run")
public class IngestionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IngestionRunSource source;

    @Column(name = "range_start")
    private Instant rangeStart;

    @Column(name = "range_end")
    private Instant rangeEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IngestionRunStatus status;

    @Column(nullable = false)
    private int processed;

    @Column(nullable = false)
    private int inserted;

    @Column(nullable = false)
    private int updated;

    @Column(nullable = false)
    private int unchanged;

    @Column(name = "error_message")
    private String errorMessage;

    protected IngestionRun() {
    }

    private IngestionRun(
            IngestionRunSource source,
            Instant startedAt,
            Instant rangeStart,
            Instant rangeEnd) {
        this.source = source;
        this.startedAt = startedAt;
        this.rangeStart = rangeStart;
        this.rangeEnd = rangeEnd;
        status = IngestionRunStatus.RUNNING;
    }

    static IngestionRun start(
            IngestionRunSource source,
            Instant startedAt,
            Instant rangeStart,
            Instant rangeEnd) {
        Objects.requireNonNull(source, "source is required");
        Objects.requireNonNull(startedAt, "startedAt is required");
        if (rangeStart != null && rangeEnd != null && rangeStart.isAfter(rangeEnd)) {
            throw new IllegalArgumentException("rangeStart must not be after rangeEnd");
        }
        return new IngestionRun(source, startedAt, rangeStart, rangeEnd);
    }

    void succeed(IngestionResult result, Instant completedAt) {
        requireRunning();
        Objects.requireNonNull(result, "result is required");
        this.completedAt = Objects.requireNonNull(completedAt, "completedAt is required");
        status = IngestionRunStatus.SUCCEEDED;
        processed = result.processed();
        inserted = result.inserted();
        updated = result.updated();
        unchanged = result.unchanged();
        errorMessage = null;
    }

    void fail(String errorMessage, Instant completedAt) {
        requireRunning();
        this.completedAt = Objects.requireNonNull(completedAt, "completedAt is required");
        status = IngestionRunStatus.FAILED;
        this.errorMessage = Objects.requireNonNull(errorMessage, "errorMessage is required");
    }

    private void requireRunning() {
        if (status != IngestionRunStatus.RUNNING) {
            throw new IllegalStateException("Ingestion run " + id + " is already complete");
        }
    }

    public Long getId() {
        return id;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public IngestionRunSource getSource() {
        return source;
    }

    public Instant getRangeStart() {
        return rangeStart;
    }

    public Instant getRangeEnd() {
        return rangeEnd;
    }

    public IngestionRunStatus getStatus() {
        return status;
    }

    public int getProcessed() {
        return processed;
    }

    public int getInserted() {
        return inserted;
    }

    public int getUpdated() {
        return updated;
    }

    public int getUnchanged() {
        return unchanged;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
