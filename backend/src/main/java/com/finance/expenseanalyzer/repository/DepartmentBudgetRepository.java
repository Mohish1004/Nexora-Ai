package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.DepartmentBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentBudgetRepository extends JpaRepository<DepartmentBudget, Long> {
    List<DepartmentBudget> findByUserIdOrderByMonthDesc(Long userId);
    Optional<DepartmentBudget> findByUserIdAndMonth(Long userId, String month);
}
