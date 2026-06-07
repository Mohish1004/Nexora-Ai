package com.finance.expenseanalyzer.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDto {
    private Long id;

    @NotBlank(message = "Goal name is required")
    private String name;

    @NotNull(message = "Target amount is required")
    @DecimalMin(value = "0.0", message = "Target amount must be greater than or equal to 0")
    private Double targetAmount;

    @NotNull(message = "Current amount is required")
    @DecimalMin(value = "0.0", message = "Current amount must be greater than or equal to 0")
    private Double currentAmount;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;

    @NotBlank(message = "Category is required")
    private String category;
}
