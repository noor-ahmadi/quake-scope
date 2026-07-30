# quake-scope

`quake-scope` is a backend-first earthquake dashboard that ingests USGS GeoJSON,
keeps source revisions, and exposes a stable API for maps and analytics.

The first vertical slice is intentionally narrow: it parses a deterministic
USGS-shaped fixture, performs idempotent PostgreSQL upserts, and serves a
paginated earthquake endpoint.

## Stack

- Java 17 and Spring Boot 4.1
- Spring MVC and WebClient
- Spring Data JPA, PostgreSQL 18, and Flyway
- Testcontainers and JUnit 6
- Maven Wrapper

## Run the vertical slice

Requirements: Java 17 and Docker.

```bash
docker compose up -d postgres
./mvnw spring-boot:run -Dspring-boot.run.profiles=fixture
```

On Windows PowerShell, use `.\mvnw.cmd` in place of `./mvnw`.

The `fixture` profile imports
`src/main/resources/fixtures/usgs/sample-feed.geojson` on startup. Repeated
imports update `last_seen_at` without creating duplicate events.

```bash
curl "http://localhost:8080/api/v1/earthquakes?page=0&size=20"
curl "http://localhost:8080/actuator/health"
```

Stop the local database with:

```bash
docker compose down
```

## Verify

```bash
./mvnw verify
```

The integration suite starts PostgreSQL 18 through Testcontainers, applies the
Flyway migration, imports the fixture, verifies idempotency, and exercises the
HTTP response and page metadata.

## Current API

### `GET /api/v1/earthquakes`

Returns earthquakes newest-first by default. It accepts Spring-style `page`,
`size`, and `sort` query parameters; page size is capped at 100.

```json
{
  "content": [
    {
      "usgsId": "qs-demo-001",
      "magnitude": 3.2,
      "place": "12 km NW of The Geysers, CA",
      "occurredAt": "2026-07-30T19:00:00Z",
      "longitude": -122.846,
      "latitude": 38.842,
      "depthKm": 2.7
    }
  ],
  "page": {
    "page": 0,
    "size": 20,
    "totalElements": 3,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

## Next

The next backend milestones add live USGS catch-up ingestion, filters, event
details, ingestion-run metrics, analytics, retry handling, and retention.

## License

MIT
