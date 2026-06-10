package com.finance.expenseanalyzer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "runway_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RunwayGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "target_amount", nullable = false)
    private Double targetAmount;

    @Column(name = "current_amount", nullable = false)
    private Double currentAmount;
}
