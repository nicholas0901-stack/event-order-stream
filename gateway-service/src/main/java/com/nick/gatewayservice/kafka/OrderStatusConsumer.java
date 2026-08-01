package com.nick.gatewayservice.kafka;

import com.nick.gatewayservice.service.SseEmitterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusConsumer.class);

    private final SseEmitterRegistry registry;

    public OrderStatusConsumer(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    @KafkaListener(topics = "${app.kafka.topic.order-status-updates}", groupId = "${spring.kafka.consumer.group-id}")
    public void onStatusUpdate(OrderStatusUpdatedEvent event) {
        log.info("Broadcasting status={} for orderId={} to {} client(s)",
                event.status(), event.orderId(), registry.activeConnections());
        registry.broadcast("order-status", event);
    }
}
