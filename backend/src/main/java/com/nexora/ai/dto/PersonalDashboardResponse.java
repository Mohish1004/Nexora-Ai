package com.nexora.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalDashboardResponse {
    private BigDecimal currentBalance;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal savingsRate; // Percentage (Income - Expense) / Income * 100
    private List<TransactionResponse> recentTransactions;
}
