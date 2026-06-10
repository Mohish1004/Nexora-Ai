package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.RunwayGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RunwayGoalRepository extends JpaRepository<RunwayGoal, Long> {
    List<RunwayGoal> findByUserId(Long userId);
}
