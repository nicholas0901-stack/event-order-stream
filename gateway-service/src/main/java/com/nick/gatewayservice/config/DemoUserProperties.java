package com.nick.gatewayservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.demo-user")
public record DemoUserProperties(String username, String password) {
}
