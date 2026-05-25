package com.inventory.gateway.config;

import com.inventory.gateway.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class GatewayConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()

                // Auth routes — no JWT filter
                .route("auth-service", r -> r
                        .path("/auth/**")
                        .uri("http://localhost:8081"))

                // Inventory routes — JWT required
                .route("inventory-service", r -> r
                        .path("/products/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(
                                new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8082"))

                // Order routes — JWT required
                .route("order-service", r -> r
                        .path("/orders/**")
                        .filters(f -> f.filter(jwtAuthFilter.apply(
                                new JwtAuthenticationFilter.Config())))
                        .uri("http://localhost:8083"))

                .build();
    }
}