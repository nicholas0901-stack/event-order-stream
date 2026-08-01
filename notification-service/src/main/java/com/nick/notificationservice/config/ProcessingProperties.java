package com.nick.notificationservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.processing")
public record ProcessingProperties(int minDelaySeconds, int maxDelaySeconds, double failureRate) {
}
