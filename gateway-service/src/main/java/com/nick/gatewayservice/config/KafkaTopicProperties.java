package com.nick.gatewayservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.kafka.topic")
public record KafkaTopicProperties(String orderStatusUpdates) {
}
