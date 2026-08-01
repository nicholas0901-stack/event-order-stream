package com.nick.notificationservice.kafka;

import com.nick.notificationservice.model.OrderStatus;
import java.time.Instant;
import java.util.UUID;

public record OrderStatusUpdatedEvent(
        UUID orderId,
        String customerName,
        OrderStatus status,
        Instant updatedAt
) {
}
