package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

record EarthquakeFilter(
        Double minMagnitude,
        Double maxMagnitude,
        Instant occurredAfter,
        Instant occurredBefore,
        Boolean tsunami,
        String status,
        String alert,
        String placeContains,
        Double minLongitude,
        Double maxLongitude,
        Double minLatitude,
        Double maxLatitude) {

    EarthquakeFilter {
        requireFinite(minMagnitude, "minMagnitude");
        requireFinite(maxMagnitude, "maxMagnitude");
        requireFinite(minLongitude, "minLongitude");
        requireFinite(maxLongitude, "maxLongitude");
        requireFinite(minLatitude, "minLatitude");
        requireFinite(maxLatitude, "maxLatitude");
        requireCoordinate(minLongitude, "minLongitude", -180, 180);
        requireCoordinate(maxLongitude, "maxLongitude", -180, 180);
        requireCoordinate(minLatitude, "minLatitude", -90, 90);
        requireCoordinate(maxLatitude, "maxLatitude", -90, 90);
        requireAscending(minMagnitude, maxMagnitude, "minMagnitude", "maxMagnitude");
        requireAscending(minLongitude, maxLongitude, "minLongitude", "maxLongitude");
        requireAscending(minLatitude, maxLatitude, "minLatitude", "maxLatitude");
        if (occurredAfter != null && occurredBefore != null
                && occurredAfter.isAfter(occurredBefore)) {
            throw new IllegalArgumentException(
                    "occurredAfter must be before or equal to occurredBefore");
        }
        status = normalize(status);
        alert = normalize(alert);
        placeContains = normalize(placeContains);
    }

    Specification<EarthquakeEvent> specification() {
        return (root, query, criteriaBuilder) -> toPredicate(root, criteriaBuilder);
    }

    Predicate toPredicate(Root<EarthquakeEvent> root, CriteriaBuilder builder) {
        List<Predicate> predicates = new ArrayList<>();
        if (minMagnitude != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("magnitude"), minMagnitude));
        }
        if (maxMagnitude != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("magnitude"), maxMagnitude));
        }
        if (occurredAfter != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("occurredAt"), occurredAfter));
        }
        if (occurredBefore != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("occurredAt"), occurredBefore));
        }
        if (tsunami != null) {
            predicates.add(builder.equal(root.get("tsunami"), tsunami));
        }
        if (status != null) {
            predicates.add(builder.equal(builder.lower(root.get("status")), status));
        }
        if (alert != null) {
            predicates.add(builder.equal(builder.lower(root.get("alert")), alert));
        }
        if (placeContains != null) {
            predicates.add(builder.like(
                    builder.lower(root.get("place")),
                    "%" + escapeLike(placeContains) + "%",
                    '\\'));
        }
        if (minLongitude != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("longitude"), minLongitude));
        }
        if (maxLongitude != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("longitude"), maxLongitude));
        }
        if (minLatitude != null) {
            predicates.add(builder.greaterThanOrEqualTo(root.get("latitude"), minLatitude));
        }
        if (maxLatitude != null) {
            predicates.add(builder.lessThanOrEqualTo(root.get("latitude"), maxLatitude));
        }
        return builder.and(predicates.toArray(Predicate[]::new));
    }

    private static void requireFinite(Double value, String name) {
        if (value != null && !Double.isFinite(value)) {
            throw new IllegalArgumentException(name + " must be finite");
        }
    }

    private static void requireCoordinate(Double value, String name, double minimum, double maximum) {
        if (value != null && (value < minimum || value > maximum)) {
            throw new IllegalArgumentException(
                    name + " must be between " + minimum + " and " + maximum);
        }
    }

    private static void requireAscending(
            Double minimum,
            Double maximum,
            String minimumName,
            String maximumName) {
        if (minimum != null && maximum != null && minimum > maximum) {
            throw new IllegalArgumentException(
                    minimumName + " must be less than or equal to " + maximumName);
        }
    }

    private static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
