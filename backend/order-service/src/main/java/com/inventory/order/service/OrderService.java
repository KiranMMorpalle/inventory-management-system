package com.inventory.order.service;

import com.inventory.order.config.InventoryClient;
import com.inventory.order.dto.*;
import com.inventory.order.entity.Order;
import com.inventory.order.entity.OrderItem;
import com.inventory.order.exception.InsufficientStockException;
import com.inventory.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;

    // ─── Place Order ───────────────────────────────────────────

    @Transactional
    public OrderResponse placeOrder(OrderRequest request,
                                    String username,
                                    String authToken) {

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Step 1 — validate stock and build order items
        for (OrderItemRequest itemRequest : request.getItems()) {

            ProductResponse product = inventoryClient.getProduct(
                    itemRequest.getProductId(), authToken);

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for product: " + product.getProductName()
                                + ". Available: " + product.getQuantity()
                                + ", Requested: " + itemRequest.getQuantity());
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            orderItems.add(OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getProductName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(itemTotal)
                    .build());
        }

        // Step 2 — save the order
        Order order = Order.builder()
                .username(username)
                .totalAmount(totalAmount)
                .status(Order.OrderStatus.PLACED)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Step 3 — link items to order and save
        orderItems.forEach(item -> item.setOrder(savedOrder));
        savedOrder.getOrderItems().addAll(orderItems);
        orderRepository.save(savedOrder);

        // Step 4 — reduce stock in Inventory Service
        for (OrderItemRequest itemRequest : request.getItems()) {
            inventoryClient.reduceStock(
                    itemRequest.getProductId(),
                    itemRequest.getQuantity(),
                    authToken);
        }

        log.info("Order placed successfully. OrderId: {}, User: {}",
                savedOrder.getId(), username);

        return mapToResponse(savedOrder);
    }

    // ─── Get All Orders (admin / history) ─────────────────────

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get Orders by logged-in User ─────────────────────────

    public List<OrderResponse> getMyOrders(String username) {
        return orderRepository.findByUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ─── Get Order by ID ───────────────────────────────────────

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return mapToResponse(order);
    }

    // ─── Cancel Order + Restore Stock (Bonus) ─────────────────

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String username, String authToken) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!order.getUsername().equals(username)) {
            throw new RuntimeException("You are not authorized to cancel this order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        // Restore stock for each item
        order.getOrderItems().forEach(item ->
                inventoryClient.reduceStock(
                        item.getProductId(),
                        -item.getQuantity(),   // negative = restore
                        authToken)
        );

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);

        log.info("Order cancelled. OrderId: {}, User: {}", orderId, username);
        return mapToResponse(updated);
    }

    // ─── Mapper ────────────────────────────────────────────────

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems()
                .stream()
                .map(item -> OrderItemResponse.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .username(order.getUsername())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}