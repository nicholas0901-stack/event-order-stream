package com.nick.notificationservice.service;

import com.nick.notificationservice.config.ProcessingProperties;
import com.nick.notificationservice.kafka.OrderCreatedEvent;
import com.nick.notificationservice.kafka.OrderStatusProducer;
import com.nick.notificationservice.kafka.OrderStatusUpdatedEvent;
import com.nick.notificationservice.model.OrderStatus;
import com.nick.notificationservice.model.OrderStatusRecord;
import com.nick.notificationservice.repository.OrderStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderProcessingService {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingService.class);

    private final OrderStatusRepository repository;
    private final OrderStatusProducer producer;
    private final ProcessingProperties processingProperties;

    public OrderProcessingService(OrderStatusRepository repository,
                                   OrderStatusProducer producer,
                                   ProcessingProperties processingProperties) {
        this.repository = repository;
        this.producer = producer;
        this.processingProperties = processingProperties;
    }

    /**
     * Runs on a separate thread so the Kafka listener thread returns immediately
     * (avoids blocking consumer poll / triggering a rebalance on slow "processing").
     */
    @Async
    public void process(OrderCreatedEvent event) {
        OrderStatusRecord record = new OrderStatusRecord(event.orderId(), OrderStatus.PROCESSING, event.customerName());
        repository.save(record);
        producer.publish(toEvent(record));

        int delaySeconds = ThreadLocalRandom.current()
                .nextInt(processingProperties.minDelaySeconds(), processingProperties.maxDelaySeconds() + 1);
        sleep(delaySeconds);

        boolean failed = ThreadLocalRandom.current().nextDouble() < processingProperties.failureRate();
        record.setStatus(failed ? OrderStatus.FAILED : OrderStatus.CONFIRMED);
        repository.save(record);
        producer.publish(toEvent(record));
    }

    private void sleep(int seconds) {
        try {
            Thread.sleep(seconds * 1000L);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Processing sleep interrupted", e);
        }
    }

    private OrderStatusUpdatedEvent toEvent(OrderStatusRecord record) {
        return new OrderStatusUpdatedEvent(record.getOrderId(), record.getCustomerName(), record.getStatus(), Instant.now());
    }
}
