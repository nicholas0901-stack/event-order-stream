package com.nick.orderservice.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record OrderItemRequest(
        @NotBlank(message = "productName is required")
        String productName,

        @NotNull
        @Min(value = 1, message = "quantity must be at least 1")
        Integer quantity,

        @NotNull
        @DecimalMin(value = "0.01", message = "unitPrice must be positive")
        BigDecimal unitPrice
) {
}
