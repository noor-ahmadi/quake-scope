package dev.noorahmadi.quakescope.earthquake;

public record IngestionResult(int processed, int inserted, int updated, int unchanged) {

    public static IngestionResult empty() {
        return new IngestionResult(0, 0, 0, 0);
    }

    public IngestionResult plus(IngestionResult other) {
        return new IngestionResult(
                processed + other.processed,
                inserted + other.inserted,
                updated + other.updated,
                unchanged + other.unchanged);
    }
}
