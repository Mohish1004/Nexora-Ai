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
public class BusinessDashboardResponse {
    private BigDecimal inventoryValue;
    private BigDecimal totalReceivables;
    private BigDecimal totalPayables;
    private BigDecimal netProfit;
    private long lowStockCount;
    private List<TransactionResponse> recentTransactions;
}
