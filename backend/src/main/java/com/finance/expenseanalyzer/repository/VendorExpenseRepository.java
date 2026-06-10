package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.VendorExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VendorExpenseRepository extends JpaRepository<VendorExpense, Long> {
    List<VendorExpense> findByUserIdOrderByDateDesc(Long userId);
}
