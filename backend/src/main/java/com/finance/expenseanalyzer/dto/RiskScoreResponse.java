package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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
        private int index;
        private Double amount;
        private String category;
        private String date;
        private Double riskScore;
        private RiskFactors factors;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RiskFactors {
        private Double anomalyScore;
        private Double incomeRatioScore;
        private Double velocityScore;
        private Double timeScore;
    }
}
