package dev.noorahmadi.quakescope.usgs;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

@Component
public class UsgsFeedParser {

    private final JsonMapper jsonMapper;

    public UsgsFeedParser(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public List<ParsedEarthquake> parse(Resource resource) {
        try (InputStream inputStream = resource.getInputStream()) {
            UsgsFeedDocument document = jsonMapper.readValue(inputStream, UsgsFeedDocument.class);
            return parse(document);
        }
        catch (IOException | RuntimeException exception) {
            if (exception instanceof UsgsFeedParseException parseException) {
                throw parseException;
            }
            throw new UsgsFeedParseException(
                    "Unable to parse USGS feed from " + resource.getDescription(), exception);
        }
    }

    private List<ParsedEarthquake> parse(UsgsFeedDocument document) {
        if (document == null || !"FeatureCollection".equals(document.type())) {
            throw new UsgsFeedParseException("USGS feed must be a GeoJSON FeatureCollection");
        }
        if (document.features() == null) {
            throw new UsgsFeedParseException("USGS feed is missing its features array");
        }

        return document.features().stream().map(this::parseFeature).toList();
    }

    private ParsedEarthquake parseFeature(UsgsFeature feature) {
        if (feature == null || !"Feature".equals(feature.type())) {
            throw new UsgsFeedParseException("USGS feed contains a non-Feature entry");
        }
        if (feature.id() == null || feature.id().isBlank()) {
            throw new UsgsFeedParseException("USGS feature is missing its id");
        }
        if (feature.properties() == null) {
            throw invalidFeature(feature.id(), "properties are missing");
        }
        if (feature.properties().time() == null || feature.properties().updated() == null) {
            throw invalidFeature(feature.id(), "time and updated are required");
        }

        List<Double> coordinates = requireCoordinates(feature);
        double longitude = coordinates.get(0);
        double latitude = coordinates.get(1);
        double depthKm = coordinates.get(2);
        if (longitude < -180 || longitude > 180) {
            throw invalidFeature(feature.id(), "longitude is outside [-180, 180]");
        }
        if (latitude < -90 || latitude > 90) {
            throw invalidFeature(feature.id(), "latitude is outside [-90, 90]");
        }

        UsgsFeatureProperties properties = feature.properties();
        return new ParsedEarthquake(
                feature.id(),
                properties.mag(),
                properties.place(),
                Instant.ofEpochMilli(properties.time()),
                Instant.ofEpochMilli(properties.updated()),
                longitude,
                latitude,
                depthKm,
                properties.alert(),
                valueOrDefault(properties.status(), "unknown"),
                properties.sig() == null ? 0 : properties.sig(),
                Integer.valueOf(1).equals(properties.tsunami()),
                valueOrDefault(properties.detail(), ""),
                jsonMapper.writeValueAsString(feature));
    }

    private static List<Double> requireCoordinates(UsgsFeature feature) {
        UsgsGeometry geometry = feature.geometry();
        if (geometry == null || !"Point".equals(geometry.type())) {
            throw invalidFeature(feature.id(), "geometry must be a Point");
        }
        List<Double> coordinates = geometry.coordinates();
        if (coordinates == null || coordinates.size() < 3
                || coordinates.subList(0, 3).stream().anyMatch(value -> value == null)) {
            throw invalidFeature(feature.id(), "geometry must include longitude, latitude, and depth");
        }
        return coordinates;
    }

    private static String valueOrDefault(String value, String fallback) {
        return value == null ? fallback : value;
    }

    private static UsgsFeedParseException invalidFeature(String id, String message) {
        return new UsgsFeedParseException("Invalid USGS feature '" + id + "': " + message);
    }
}
