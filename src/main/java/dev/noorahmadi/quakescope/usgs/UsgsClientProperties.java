package dev.noorahmadi.quakescope.usgs;

import java.net.URI;
import java.util.Objects;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("quakescope.usgs")
public record UsgsClientProperties(URI baseUrl) {

    public UsgsClientProperties {
        Objects.requireNonNull(baseUrl, "baseUrl is required");
    }
}
