package dev.noorahmadi.quakescope.earthquake;

public record IngestionResult(int processed, int inserted, int updated, int unchanged) {
}
