package dev.noorahmadi.quakescope.usgs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration(proxyBeanMethods = false)
public class UsgsClientConfiguration {

    @Bean
    WebClient usgsWebClient(WebClient.Builder builder, UsgsClientProperties properties) {
        return builder
                .baseUrl(properties.baseUrl().toString())
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(
                        Math.toIntExact(properties.maxResponseSize().toBytes())))
                .build();
    }
}
