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
public class SegmentResponse {
    private List<SegmentCluster> segments;
    private String pattern;
    private String summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SegmentCluster {
        private Integer cluster;
        private Integer transactionCount;
        private Double averageAmount;
        private Double totalSpend;
        private String dominantCategory;
    }
}
