package com.nick.gatewayservice.controller;

import com.nick.gatewayservice.service.SseEmitterRegistry;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/orders")
public class OrderStreamController {

    private final SseEmitterRegistry registry;

    public OrderStreamController(SseEmitterRegistry registry) {
        this.registry = registry;
    }

    /**
     * EventSource on the frontend connects here. Auth is via ?token= query param
     * since EventSource can't set an Authorization header - see JwtAuthFilter.
     */
    @GetMapping(value = "/stream", produces = "text/event-stream")
    public SseEmitter stream() {
        return registry.register();
    }
}
