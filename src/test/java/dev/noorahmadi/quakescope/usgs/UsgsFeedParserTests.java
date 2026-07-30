package dev.noorahmadi.quakescope.usgs;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;

import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UsgsFeedParserTests {

    private UsgsFeedParser parser;

    @BeforeEach
    void setUp() {
        parser = new UsgsFeedParser(JsonMapper.builder().build());
    }

    @Test
    void parsesCoordinatesAndNullableProperties() {
        var resource = new ClassPathResource("fixtures/usgs/sample-feed.geojson");

        var earthquakes = parser.parse(resource);

        assertThat(earthquakes).hasSize(3);
        assertThat(earthquakes.get(0))
                .extracting(
                        ParsedEarthquake::usgsId,
                        ParsedEarthquake::magnitude,
                        ParsedEarthquake::longitude,
                        ParsedEarthquake::latitude,
                        ParsedEarthquake::depthKm)
                .containsExactly("qs-demo-001", 3.2, -122.846, 38.842, 2.7);
        assertThat(earthquakes.get(2).magnitude()).isNull();
        assertThat(earthquakes.get(2).place()).isNull();
        assertThat(earthquakes.get(2).rawJson()).contains("\"id\":\"qs-demo-003\"");
    }

    @Test
    void rejectsCoordinatesOutsideGeoJsonBounds() {
        var resource = new ByteArrayResource("""
                {
                  "type": "FeatureCollection",
                  "features": [{
                    "type": "Feature",
                    "id": "invalid-coordinate",
                    "properties": {
                      "time": 1785430800000,
                      "updated": 1785430860000
                    },
                    "geometry": {
                      "type": "Point",
                      "coordinates": [181, 40, 2]
                    }
                  }]
                }
                """.getBytes());

        assertThatThrownBy(() -> parser.parse(resource))
                .isInstanceOf(UsgsFeedParseException.class)
                .hasMessageContaining("longitude is outside");
    }
}
