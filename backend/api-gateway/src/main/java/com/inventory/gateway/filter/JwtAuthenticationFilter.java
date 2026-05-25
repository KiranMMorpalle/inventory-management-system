package com.inventory.gateway.filter;

import com.inventory.gateway.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@Slf4j
public class JwtAuthenticationFilter
        extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        super(Config.class);
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {

            String path = exchange.getRequest().getURI().getPath();
            log.debug("Gateway request: {}", path);

            // Extract Authorization header
            String authHeader = exchange.getRequest()
                    .getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            // Missing or malformed token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Missing or invalid Authorization header for path: {}", path);
                return unauthorizedResponse(exchange, "Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            // Validate token
            if (!jwtUtil.isTokenValid(token)) {
                log.warn("Invalid or expired JWT token for path: {}", path);
                return unauthorizedResponse(exchange, "Invalid or expired token");
            }

            // Token valid — extract username and pass downstream
            String username = jwtUtil.extractUsername(token);
            log.debug("Authenticated user: {} -> {}", username, path);

            // Add username as header so downstream services can use it
            ServerWebExchange modifiedExchange = exchange.mutate()
                    .request(r -> r.header("X-Auth-Username", username))
                    .build();

            return chain.filter(modifiedExchange);
        };
    }

    private Mono<Void> unauthorizedResponse(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        var buffer = exchange.getResponse()
                .bufferFactory()
                .wrap(("{\"error\": \"" + message + "\"}").getBytes());
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    // Required config class even if empty
    public static class Config {
    }
}