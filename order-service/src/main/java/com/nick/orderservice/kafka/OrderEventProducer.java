package com.nick.orderservice.kafka;

import com.nick.orderservice.config.KafkaTopicProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventProducer {

    private static final Logger log = LoggerFactory.getLogger(OrderEventProducer.class);

    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    private final KafkaTopicProperties topicProperties;

    public OrderEventProducer(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate,
                               KafkaTopicProperties topicProperties) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicProperties = topicProperties;
    }

    public void publishOrderCreated(OrderCreatedEvent event) {
        String key = event.orderId().toString();
        kafkaTemplate.send(topicProperties.orderEvents(), key, event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish order-created event for orderId={}", event.orderId(), ex);
                    } else {
                        log.info("Published order-created event for orderId={} to partition={}",
                                event.orderId(), result.getRecordMetadata().partition());
                    }
                });
    }
}
