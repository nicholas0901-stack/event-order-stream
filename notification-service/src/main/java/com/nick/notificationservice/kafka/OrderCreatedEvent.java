package com.nick.notificationservice.kafka;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

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
