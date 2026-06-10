package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScoreResponse {
    private Double overallRisk;
    private List<TransactionRisk> transactionRisks;
    private List<String> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionRisk {
        private Integer index;
        private Double amount;
        private String category;
        private String date;
        private Double riskScore;
        private Map<String, Double> factors;
    }
}
