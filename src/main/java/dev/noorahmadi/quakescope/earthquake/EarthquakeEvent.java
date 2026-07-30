package dev.noorahmadi.quakescope.earthquake;

import java.time.Instant;
import java.util.Objects;

import dev.noorahmadi.quakescope.usgs.ParsedEarthquake;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "earthquake_event")
public class EarthquakeEvent {

    @Id
    @Column(name = "usgs_id", nullable = false, length = 32)
    private String usgsId;

    private Double magnitude;

    private String place;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "source_updated_at", nullable = false)
    private Instant sourceUpdatedAt;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private double latitude;

    @Column(name = "depth_km", nullable = false)
    private double depthKm;

    private String alert;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private int significance;

    @Column(nullable = false)
    private boolean tsunami;

    @Column(name = "detail_url", nullable = false)
    private String detailUrl;

    @Column(name = "raw_json", nullable = false, columnDefinition = "text")
    private String rawJson;

    @Column(name = "first_seen_at", nullable = false)
    private Instant firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    protected EarthquakeEvent() {
    }

    private EarthquakeEvent(ParsedEarthquake earthquake, Instant observedAt) {
        usgsId = earthquake.usgsId();
        firstSeenAt = observedAt;
        applyValues(earthquake);
        lastSeenAt = observedAt;
    }

    static EarthquakeEvent create(ParsedEarthquake earthquake, Instant observedAt) {
        Objects.requireNonNull(earthquake, "earthquake is required");
        Objects.requireNonNull(observedAt, "observedAt is required");
        return new EarthquakeEvent(earthquake, observedAt);
    }

    boolean observe(ParsedEarthquake earthquake, Instant observedAt) {
        Objects.requireNonNull(earthquake, "earthquake is required");
        Objects.requireNonNull(observedAt, "observedAt is required");
        lastSeenAt = observedAt;

        boolean newerRevision = earthquake.sourceUpdatedAt().isAfter(sourceUpdatedAt);
        boolean changedAtSameRevision = earthquake.sourceUpdatedAt().equals(sourceUpdatedAt)
                && !earthquake.rawJson().equals(rawJson);
        if (newerRevision || changedAtSameRevision) {
            applyValues(earthquake);
            return true;
        }
        return false;
    }

    private void applyValues(ParsedEarthquake earthquake) {
        magnitude = earthquake.magnitude();
        place = earthquake.place();
        occurredAt = earthquake.occurredAt();
        sourceUpdatedAt = earthquake.sourceUpdatedAt();
        longitude = earthquake.longitude();
        latitude = earthquake.latitude();
        depthKm = earthquake.depthKm();
        alert = earthquake.alert();
        status = earthquake.status();
        significance = earthquake.significance();
        tsunami = earthquake.tsunami();
        detailUrl = earthquake.detailUrl();
        rawJson = earthquake.rawJson();
    }

    public String getUsgsId() {
        return usgsId;
    }

    public Double getMagnitude() {
        return magnitude;
    }

    public String getPlace() {
        return place;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public Instant getSourceUpdatedAt() {
        return sourceUpdatedAt;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getDepthKm() {
        return depthKm;
    }

    public String getAlert() {
        return alert;
    }

    public String getStatus() {
        return status;
    }

    public int getSignificance() {
        return significance;
    }

    public boolean isTsunami() {
        return tsunami;
    }

    public String getDetailUrl() {
        return detailUrl;
    }

    public Instant getFirstSeenAt() {
        return firstSeenAt;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }
}
