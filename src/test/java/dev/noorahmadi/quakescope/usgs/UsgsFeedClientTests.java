package dev.noorahmadi.quakescope.usgs;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.util.unit.DataSize;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UsgsFeedClientTests {

    private HttpServer server;
    private AtomicInteger requests;

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        requests = new AtomicInteger();
        server.start();
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    @Test
    void retriesTransientFailuresBeforeReturningFeed() {
        byte[] feed = "{\"type\":\"FeatureCollection\",\"features\":[]}".getBytes(StandardCharsets.UTF_8);
        server.createContext("/feed", exchange -> {
            if (requests.incrementAndGet() < 3) {
                respond(exchange, 503, new byte[0]);
            }
            else {
                respond(exchange, 200, feed);
            }
        });

        UsgsFeedClient client = client(3);

        assertThat(client.fetchLatest()).isEqualTo(feed);
        assertThat(requests).hasValue(3);
    }

    @Test
    void doesNotRetryClientErrors() {
        server.createContext("/feed", exchange -> {
            requests.incrementAndGet();
            respond(exchange, 404, new byte[0]);
        });

        UsgsFeedClient client = client(3);

        assertThatThrownBy(client::fetchLatest)
                .isInstanceOf(UsgsFeedClientException.class)
                .hasMessage("Unable to retrieve the USGS earthquake feed");
        assertThat(requests).hasValue(1);
    }

    @Test
    void buildsPagedCatalogQueries() {
        byte[] feed = "{\"type\":\"FeatureCollection\",\"features\":[]}".getBytes(StandardCharsets.UTF_8);
        AtomicReference<String> query = new AtomicReference<>();
        server.createContext("/query", exchange -> {
            query.set(exchange.getRequestURI().getRawQuery());
            respond(exchange, 200, feed);
        });

        UsgsFeedClient client = client(1);

        assertThat(client.fetchCatalogPage(
                Instant.parse("2026-08-01T00:00:00Z"),
                Instant.parse("2026-08-02T00:00:00Z"),
                500,
                1001)).isEqualTo(feed);
        assertThat(query.get())
                .contains("format=geojson")
                .contains("eventtype=earthquake")
                .contains("orderby=time-asc")
                .contains("starttime=2026-08-01T00:00:00Z")
                .contains("endtime=2026-08-02T00:00:00Z")
                .contains("limit=500")
                .contains("offset=1001");
    }

    @Test
    void acceptsCatalogResponsesLargerThanTheFrameworkDefaultBuffer() {
        byte[] feed = new byte[300_000];
        server.createContext("/feed", exchange -> respond(exchange, 200, feed));

        UsgsFeedClient client = client(1);

        assertThat(client.fetchLatest()).hasSize(feed.length);
    }

    private UsgsFeedClient client(int maxAttempts) {
        URI baseUrl = URI.create("http://127.0.0.1:" + server.getAddress().getPort());
        UsgsClientProperties properties = new UsgsClientProperties(
                baseUrl,
                "/feed",
                "/query",
                DataSize.ofMegabytes(1),
                Duration.ofSeconds(2),
                maxAttempts,
                Duration.ofMillis(1));
        WebClient webClient = new UsgsClientConfiguration()
                .usgsWebClient(WebClient.builder(), properties);
        return new UsgsFeedClient(webClient, properties);
    }

    private static void respond(HttpExchange exchange, int status, byte[] body) throws IOException {
        exchange.getResponseHeaders().add("Content-Type", "application/geo+json");
        exchange.sendResponseHeaders(status, body.length);
        try (var responseBody = exchange.getResponseBody()) {
            responseBody.write(body);
        }
    }
}
