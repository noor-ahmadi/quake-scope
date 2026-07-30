package dev.noorahmadi.quakescope.usgs;

public class UsgsFeedParseException extends RuntimeException {

    public UsgsFeedParseException(String message) {
        super(message);
    }

    public UsgsFeedParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
