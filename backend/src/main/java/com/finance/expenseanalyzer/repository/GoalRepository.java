package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdOrderByDeadlineAsc(Long userId);
}
