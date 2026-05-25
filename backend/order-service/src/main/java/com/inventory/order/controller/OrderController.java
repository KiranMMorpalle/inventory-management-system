package com.inventory.order.controller;

import com.inventory.order.dto.OrderRequest;
import com.inventory.order.dto.OrderResponse;
import com.inventory.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order Placement and History APIs")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order")
    public ResponseEntity<OrderResponse> placeOrder(
            @Valid @RequestBody OrderRequest request,
            Principal principal,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(request, principal.getName(), token));
    }

    @GetMapping
    @Operation(summary = "Get all orders (admin view)")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get logged-in user's orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Principal principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order and restore stock")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            Principal principal,
            HttpServletRequest httpRequest) {

        String token = extractToken(httpRequest);
        return ResponseEntity.ok(orderService.cancelOrder(id, principal.getName(), token));
    }

    // Extract raw JWT token from Authorization header
    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}