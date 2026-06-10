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
public class AnomalyResponse {
    private List<AnomalyRecord> anomalies;
    private Double riskScore;
    private String summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnomalyRecord {
        private Integer index;
        private Double amount;
        private String category;
        private String date;
        private Double riskScore;
        private String reason;
    }
}
