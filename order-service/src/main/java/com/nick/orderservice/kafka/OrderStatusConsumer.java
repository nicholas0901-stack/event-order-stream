package com.nick.orderservice.kafka;

import com.nick.orderservice.model.Order;
import com.nick.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderStatusConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusConsumer.class);

    private final OrderRepository orderRepository;

    public OrderStatusConsumer(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @KafkaListener(topics = "${app.kafka.topic.order-status-updates}", groupId = "${spring.kafka.consumer.group-id}")
    @Transactional
    public void onStatusUpdate(OrderStatusUpdatedEvent event) {
        orderRepository.findById(event.orderId()).ifPresentOrElse(
                order -> {
                    order.setStatus(event.status());
                    orderRepository.save(order);
                    log.info("Synced status={} for orderId={}", event.status(), event.orderId());
                },
                () -> log.warn("Received status update for unknown orderId={}", event.orderId())
        );
    }
}
