package com.nick.orderservice.kafka;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Event contract published to the "order-events" Kafka topic.
 * notification-service deserializes this same shape when consuming.
 */
public record OrderCreatedEvent(
        UUID orderId,
        String customerName,
        BigDecimal totalAmount,
        List<ItemPayload> items,
        Instant createdAt
) {
    public record ItemPayload(String productName, Integer quantity, BigDecimal unitPrice) {
    }
}
