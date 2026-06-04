package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OcrScanResponse {
    private Double amount;
    private LocalDate date;
    private String category;
    private String extractedText;
    private Double confidence;
}
