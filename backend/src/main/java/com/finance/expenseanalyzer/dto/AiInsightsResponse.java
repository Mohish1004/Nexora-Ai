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
public class AiInsightsResponse {
    private List<String> behaviorAnalysis;
    private List<String> savingsSuggestions;
    private List<String> unusualSpendingAlerts;
    private Double potentialSavings;
}
