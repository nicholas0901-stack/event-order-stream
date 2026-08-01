package com.nick.orderservice.dto;

import com.nick.orderservice.model.Order;
import com.nick.orderservice.model.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        String customerName,
        OrderStatus status,
        BigDecimal totalAmount,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(i.getId(), i.getProductName(), i.getQuantity(), i.getUnitPrice()))
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomerName(),
                order.getStatus(),
                order.getTotalAmount(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    public record OrderItemResponse(UUID id, String productName, Integer quantity, BigDecimal unitPrice) {
    }
}
