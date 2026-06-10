package com.nexora.ai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VendorRequest {
    @NotBlank(message = "Vendor name is required")
    private String name;

    private String email;
    private String phone;

    @NotNull(message = "Amount owed is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount owed cannot be negative")
    private BigDecimal amountOwed;
}
