package com.nexora.ai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ReceivablesPayablesRequest {
    @NotBlank(message = "Type is required (RECEIVABLE or PAYABLE)")
    private String type;

    @NotBlank(message = "Party name is required")
    private String partyName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String status; // PENDING, PAID, OVERDUE
}
