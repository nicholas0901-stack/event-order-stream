package com.nick.notificationservice.kafka;

import com.nick.notificationservice.service.OrderProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventsConsumer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventsConsumer.class);

    private final OrderProcessingService processingService;

    public OrderEventsConsumer(OrderProcessingService processingService) {
        this.processingService = processingService;
    }

    @KafkaListener(topics = "${app.kafka.topic.order-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Received order-created event for orderId={}", event.orderId());
        processingService.process(event);
    }
}
