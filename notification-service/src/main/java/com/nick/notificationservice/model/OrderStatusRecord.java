package com.nick.notificationservice.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "order_status_records")
public class OrderStatusRecord {

    @Id
    private UUID orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    private String customerName;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public OrderStatusRecord() {
    }

    public OrderStatusRecord(UUID orderId, OrderStatus status, String customerName) {
        this.orderId = orderId;
        this.status = status;
        this.customerName = customerName;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public String getCustomerName() {
        return customerName;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
