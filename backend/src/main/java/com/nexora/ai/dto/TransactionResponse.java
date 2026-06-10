package com.nexora.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {
    private Long id;
    private Long workspaceId;
    private String type; // INCOME, EXPENSE
    private BigDecimal amount;
    private String category;
    private LocalDate date;
    private String description;
}
