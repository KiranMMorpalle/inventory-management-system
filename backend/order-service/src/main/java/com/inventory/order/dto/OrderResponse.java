package com.inventory.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String username;
    private BigDecimal totalAmount;
    private String status;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}