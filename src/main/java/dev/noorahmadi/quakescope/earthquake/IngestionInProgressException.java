package dev.noorahmadi.quakescope.earthquake;

public class IngestionInProgressException extends RuntimeException {

    public IngestionInProgressException() {
        super("An ingestion run is already in progress");
    }
}
