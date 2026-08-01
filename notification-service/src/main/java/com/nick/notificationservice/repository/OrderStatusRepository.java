package com.nick.notificationservice.repository;

import com.nick.notificationservice.model.OrderStatusRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrderStatusRepository extends JpaRepository<OrderStatusRecord, UUID> {
}
