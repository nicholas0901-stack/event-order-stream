package com.nick.orderservice.service;

import com.nick.orderservice.dto.OrderRequest;
import com.nick.orderservice.dto.OrderResponse;
import com.nick.orderservice.exception.OrderNotFoundException;
import com.nick.orderservice.kafka.OrderCreatedEvent;
import com.nick.orderservice.kafka.OrderEventProducer;
import com.nick.orderservice.model.Order;
import com.nick.orderservice.model.OrderItem;
import com.nick.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer orderEventProducer;

    public OrderService(OrderRepository orderRepository, OrderEventProducer orderEventProducer) {
        this.orderRepository = orderRepository;
        this.orderEventProducer = orderEventProducer;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Order order = new Order();
        order.setCustomerName(request.customerName());

        request.items().forEach(itemReq ->
                order.addItem(new OrderItem(itemReq.productName(), itemReq.quantity(), itemReq.unitPrice())));

        order.recalculateTotal();
        Order saved = orderRepository.save(order);

        orderEventProducer.publishOrderCreated(toEvent(saved));

        return OrderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(OrderResponse::from).toList();
    }

    private OrderCreatedEvent toEvent(Order order) {
        List<OrderCreatedEvent.ItemPayload> items = order.getItems().stream()
                .map(i -> new OrderCreatedEvent.ItemPayload(i.getProductName(), i.getQuantity(), i.getUnitPrice()))
                .toList();

        return new OrderCreatedEvent(
                order.getId(),
                order.getCustomerName(),
                order.getTotalAmount(),
                items,
                order.getCreatedAt()
        );
    }
}
