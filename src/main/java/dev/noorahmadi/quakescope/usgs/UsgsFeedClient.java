package dev.noorahmadi.quakescope.usgs;

import java.time.Instant;
import java.util.function.Supplier;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Component
public class UsgsFeedClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsgsFeedClient.class);
    private static final MediaType GEO_JSON = MediaType.parseMediaType("application/geo+json");

    private final WebClient webClient;
    private final UsgsClientProperties properties;

    public UsgsFeedClient(WebClient usgsWebClient, UsgsClientProperties properties) {
        this.webClient = usgsWebClient;
        this.properties = properties;
    }

    public byte[] fetchLatest() {
        return execute(
                () -> request(properties.feedPath()),
                "Unable to retrieve the USGS earthquake feed");
    }

    public byte[] fetchCatalogPage(
            Instant start,
            Instant end,
            int limit,
            int offset) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("start must not be after end");
        }
        if (limit < 1 || limit > 20_000) {
            throw new IllegalArgumentException("limit must be between 1 and 20000");
        }
        if (offset < 1) {
            throw new IllegalArgumentException("offset must be at least 1");
        }

        return execute(
                () -> webClient.get()
                        .uri(builder -> builder
                                .path(properties.queryPath())
                                .queryParam("format", "geojson")
                                .queryParam("eventtype", "earthquake")
                                .queryParam("orderby", "time-asc")
                                .queryParam("starttime", start)
                                .queryParam("endtime", end)
                                .queryParam("limit", limit)
                                .queryParam("offset", offset)
                                .build())
                        .accept(GEO_JSON, MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(byte[].class)
                        .timeout(properties.requestTimeout()),
                "Unable to retrieve the USGS earthquake catalog");
    }

    private Mono<byte[]> request(String path) {
        return webClient.get()
                .uri(path)
                .accept(GEO_JSON, MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(byte[].class)
                .timeout(properties.requestTimeout());
    }

    private byte[] execute(Supplier<Mono<byte[]>> requestFactory, String failureMessage) {
        Mono<byte[]> request = requestFactory.get();

        if (properties.maxAttempts() > 1) {
            request = request.retryWhen(Retry
                    .backoff(properties.maxAttempts() - 1, properties.retryBackoff())
                    .filter(this::isRetryable)
                    .doBeforeRetry(signal -> LOGGER.warn(
                            "USGS feed request failed; retrying attempt {} of {}",
                            signal.totalRetries() + 2,
                            properties.maxAttempts()))
                    .onRetryExhaustedThrow((spec, signal) -> signal.failure()));
        }

        try {
            byte[] body = request.block();
            if (body == null || body.length == 0) {
                throw new IllegalStateException("USGS feed response was empty");
            }
            return body;
        }
        catch (RuntimeException exception) {
            throw new UsgsFeedClientException(failureMessage, exception);
        }
    }

    private boolean isRetryable(Throwable failure) {
        if (failure instanceof TimeoutException || failure instanceof WebClientRequestException) {
            return true;
        }
        if (failure instanceof WebClientResponseException responseException) {
            int status = responseException.getStatusCode().value();
            return status == 429 || status >= 500;
        }
        Throwable cause = failure.getCause();
        return cause != null && cause != failure && isRetryable(cause);
    }
}
