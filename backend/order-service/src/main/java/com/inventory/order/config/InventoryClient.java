package com.inventory.order.config;

import com.inventory.order.dto.ProductResponse;
import com.inventory.order.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryClient {

    private final WebClient inventoryWebClient;

    // Fetch product details from Inventory Service
    public ProductResponse getProduct(Long productId, String authToken) {
        try {
            return inventoryWebClient.get()
                    .uri("/products/{id}", productId)
                    .header("Authorization", "Bearer " + authToken)
                    .retrieve()
                    .bodyToMono(ProductResponse.class)
                    .block();
        } catch (WebClientResponseException.NotFound e) {
            throw new RuntimeException("Product not found with id: " + productId);
        } catch (Exception e) {
            log.error("Error calling Inventory Service: {}", e.getMessage());
            throw new RuntimeException("Inventory Service unavailable");
        }
    }

    // Tell Inventory Service to reduce stock
    public void reduceStock(Long productId, int quantity, String authToken) {
        try {
            inventoryWebClient.put()
                    .uri("/products/{id}/reduce-stock?quantity={qty}", productId, quantity)
                    .header("Authorization", "Bearer " + authToken)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            log.error("Stock reduction failed for product {}: {}", productId, e.getMessage());
            throw new InsufficientStockException(
                    "Stock reduction failed for product id: " + productId);
        }
    }
}