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
    private List<SegmentItem> segments;
    private String pattern;
    private String summary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SegmentItem {
        private int cluster;
        private int transactionCount;
        private Double averageAmount;
        private Double totalSpend;
        private String dominantCategory;
    }
}
