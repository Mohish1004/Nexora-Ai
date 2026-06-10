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
public class ReceivablesPayablesResponse {
    private Long id;
    private Long workspaceId;
    private String type; // RECEIVABLE, PAYABLE
    private String partyName;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String status; // PENDING, PAID, OVERDUE
}
