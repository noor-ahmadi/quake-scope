package dev.noorahmadi.quakescope.usgs;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
record UsgsFeedDocument(String type, List<UsgsFeature> features) {
}

@JsonIgnoreProperties(ignoreUnknown = true)
record UsgsFeature(
        String type,
        String id,
        UsgsFeatureProperties properties,
        UsgsGeometry geometry) {
}

@JsonIgnoreProperties(ignoreUnknown = true)
record UsgsFeatureProperties(
        Double mag,
        String place,
        Long time,
        Long updated,
        String detail,
        String alert,
        String status,
        Integer tsunami,
        Integer sig) {
}

@JsonIgnoreProperties(ignoreUnknown = true)
record UsgsGeometry(String type, List<Double> coordinates) {
}
