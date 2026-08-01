package com.nick.notificationservice.kafka;

import com.nick.notificationservice.config.KafkaTopicProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderStatusProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderStatusProducer.class);

    private final KafkaTemplate<String, OrderStatusUpdatedEvent> kafkaTemplate;
    private final KafkaTopicProperties topicProperties;

    public OrderStatusProducer(KafkaTemplate<String, OrderStatusUpdatedEvent> kafkaTemplate,
                                KafkaTopicProperties topicProperties) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicProperties = topicProperties;
    }

    public void publish(OrderStatusUpdatedEvent event) {
        kafkaTemplate.send(topicProperties.orderStatusUpdates(), event.orderId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish status update for orderId={}", event.orderId(), ex);
                    } else {
                        log.info("Published status={} for orderId={}", event.status(), event.orderId());
                    }
                });
    }
}
