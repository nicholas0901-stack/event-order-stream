package com.nick.orderservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nick.orderservice.dto.OrderItemRequest;
import com.nick.orderservice.dto.OrderRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@EmbeddedKafka(partitions = 1, topics = "order-events")
@TestPropertySource(properties = "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createOrder_persistsAndReturnsCreatedOrder() throws Exception {
        OrderRequest request = new OrderRequest(
                "Nick Ng",
                List.of(new OrderItemRequest("Mechanical keyboard", 1, new BigDecimal("129.00")))
        );

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerName").value("Nick Ng"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(129.00))
                .andExpect(jsonPath("$.items[0].productName").value("Mechanical keyboard"));
    }

    @Test
    void createOrder_rejectsInvalidRequest() throws Exception {
        String invalidJson = "{\"customerName\": \"\", \"items\": []}";

        mockMvc.perform(post("/api/orders")
                        .contentType("application/json")
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerName").exists());
    }

    @Test
    void getAllOrders_returnsList() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk());
    }
}
