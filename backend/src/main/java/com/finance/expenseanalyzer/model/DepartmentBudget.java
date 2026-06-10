package com.finance.expenseanalyzer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "department_budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "monthly_limit", nullable = false)
    private Double monthlyLimit;

    @Column(name = "budget_month", nullable = false)
    private String month; // e.g. "2026-06"
}
