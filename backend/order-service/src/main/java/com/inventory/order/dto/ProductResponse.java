package com.inventory.order.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductResponse {
    private Long id;
    private String productName;
    private String category;
    private BigDecimal price;
    private Integer quantity;
    private String stockStatus;
}