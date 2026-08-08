package dev.noorahmadi.quakescope.earthquake;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Tuple;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EarthquakeAnalyticsService {

    private final EntityManager entityManager;

    public EarthquakeAnalyticsService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public EarthquakeSummaryResponse summarize(EarthquakeFilter filter) {
        CriteriaBuilder builder = entityManager.getCriteriaBuilder();
        Tuple aggregate = aggregate(filter, builder);
        StrongestEarthquakeResponse strongestEarthquake = strongest(filter, builder);

        return new EarthquakeSummaryResponse(
                valueOrZero(aggregate.get("totalEvents", Long.class)),
                valueOrZero(aggregate.get("eventsWithMagnitude", Long.class)),
                round(aggregate.get("averageMagnitude", Double.class)),
                aggregate.get("maximumMagnitude", Double.class),
                valueOrZero(aggregate.get("tsunamiEvents", Long.class)),
                round(aggregate.get("averageDepthKm", Double.class)),
                aggregate.get("earliestOccurredAt", Instant.class),
                aggregate.get("latestOccurredAt", Instant.class),
                strongestEarthquake);
    }

    private Tuple aggregate(EarthquakeFilter filter, CriteriaBuilder builder) {
        CriteriaQuery<Tuple> query = builder.createTupleQuery();
        Root<EarthquakeEvent> root = query.from(EarthquakeEvent.class);
        Expression<Long> tsunamiEvents = builder.sum(builder.<Long>selectCase()
                .when(builder.isTrue(root.get("tsunami")), 1L)
                .otherwise(0L));

        query.select(builder.tuple(
                        builder.count(root).alias("totalEvents"),
                        builder.count(root.get("magnitude")).alias("eventsWithMagnitude"),
                        builder.avg(root.<Double>get("magnitude")).alias("averageMagnitude"),
                        builder.max(root.<Double>get("magnitude")).alias("maximumMagnitude"),
                        tsunamiEvents.alias("tsunamiEvents"),
                        builder.avg(root.<Double>get("depthKm")).alias("averageDepthKm"),
                        builder.least(root.<Instant>get("occurredAt"))
                                .alias("earliestOccurredAt"),
                        builder.greatest(root.<Instant>get("occurredAt"))
                                .alias("latestOccurredAt")))
                .where(filter.toPredicate(root, builder));

        return entityManager.createQuery(query).getSingleResult();
    }

    private StrongestEarthquakeResponse strongest(
            EarthquakeFilter filter,
            CriteriaBuilder builder) {
        CriteriaQuery<EarthquakeEvent> query = builder.createQuery(EarthquakeEvent.class);
        Root<EarthquakeEvent> root = query.from(EarthquakeEvent.class);
        Predicate hasMagnitude = builder.isNotNull(root.get("magnitude"));
        query.select(root)
                .where(builder.and(filter.toPredicate(root, builder), hasMagnitude))
                .orderBy(
                        builder.desc(root.get("magnitude")),
                        builder.desc(root.get("occurredAt")),
                        builder.asc(root.get("usgsId")));

        return entityManager.createQuery(query)
                .setMaxResults(1)
                .getResultStream()
                .findFirst()
                .map(StrongestEarthquakeResponse::from)
                .orElse(null);
    }

    private static long valueOrZero(Long value) {
        return value == null ? 0 : value;
    }

    private static Double round(Double value) {
        if (value == null) {
            return null;
        }
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
