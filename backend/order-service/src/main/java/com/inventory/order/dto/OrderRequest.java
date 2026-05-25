package com.inventory.order.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotNull(message = "Order items are required")
    @Size(min = 1, message = "At least one item is required")
    private List<OrderItemRequest> items;
}