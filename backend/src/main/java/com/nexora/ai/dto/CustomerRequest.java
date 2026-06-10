package com.nexora.ai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    private String email;
    private String phone;

    @NotNull(message = "Outstanding balance is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Outstanding balance cannot be negative")
    private BigDecimal outstandingBalance;
}
