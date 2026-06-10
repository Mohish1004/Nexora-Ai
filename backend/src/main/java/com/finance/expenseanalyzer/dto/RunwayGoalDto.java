package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RunwayGoalDto {
    private Long id;
    private String name;
    private Double targetAmount;
    private Double currentAmount;
}
