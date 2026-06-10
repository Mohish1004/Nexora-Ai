package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.RevenueInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RevenueInvoiceRepository extends JpaRepository<RevenueInvoice, Long> {
    List<RevenueInvoice> findByUserIdOrderByDateDesc(Long userId);
}
