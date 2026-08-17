package com.nick.gatewayservice.controller;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@RestController
@RequestMapping("/api/orders")
public class OrderProxyController {

    private final RestClient orderServiceClient;

    public OrderProxyController(RestClient orderServiceClient) {
        this.orderServiceClient = orderServiceClient;
    }

    @PostMapping
    public ResponseEntity<String> createOrder(@RequestBody String body) {
        try {
            String response = orderServiceClient.post()
                    .uri("/api/orders")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            return ResponseEntity.status(201).body(response);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @GetMapping
    public ResponseEntity<String> getAllOrders() {
        try {
            String response = orderServiceClient.get()
                    .uri("/api/orders")
                    .retrieve()
                    .body(String.class);
            return ResponseEntity.ok(response);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<String> getOrder(@PathVariable String orderId) {
        try {
            String response = orderServiceClient.get()
                    .uri("/api/orders/{id}", orderId)
                    .retrieve()
                    .body(String.class);
            return ResponseEntity.ok(response);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
        }
    }
}