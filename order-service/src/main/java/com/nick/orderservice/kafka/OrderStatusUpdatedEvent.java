package com.nick.orderservice.kafka;

import com.nick.orderservice.model.OrderStatus;
import java.time.Instant;
import java.util.UUID;

public record OrderStatusUpdatedEvent(
        UUID orderId,
        String customerName,
        OrderStatus status,
        Instant updatedAt
) {
}
