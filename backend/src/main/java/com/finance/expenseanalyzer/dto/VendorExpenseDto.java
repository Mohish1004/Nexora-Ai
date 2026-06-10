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
public class VendorExpenseDto {
    private Long id;
    private String vendor;
    private String description;
    private Double amount;
    private LocalDate date;
    private String category;
}
