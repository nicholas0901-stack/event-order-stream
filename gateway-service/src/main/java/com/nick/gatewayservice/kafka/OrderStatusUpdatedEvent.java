package com.nick.gatewayservice.kafka;

import java.time.Instant;
import java.util.UUID;

public record OrderStatusUpdatedEvent(
        UUID orderId,
        String customerName,
        String status,
        Instant updatedAt
) {
}
