package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrScanResponse {
    private Double amount;
    private String date;
    private String category;
    private String extractedText;
    private Double confidence;
}
