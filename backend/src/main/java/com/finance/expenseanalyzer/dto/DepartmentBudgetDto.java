package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentBudgetDto {
    private Long id;
    private Double monthlyLimit;
    private String month;
}
