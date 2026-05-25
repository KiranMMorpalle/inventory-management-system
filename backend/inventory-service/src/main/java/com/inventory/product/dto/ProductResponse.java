package com.inventory.product.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String productName;
    private String category;
    private BigDecimal price;
    private Integer quantity;
    private String stockStatus;   // IN_STOCK / LOW_STOCK / OUT_OF_STOCK
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}