package com.nick.gatewayservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.order-service")
public record OrderServiceProperties(String baseUrl) {
}
