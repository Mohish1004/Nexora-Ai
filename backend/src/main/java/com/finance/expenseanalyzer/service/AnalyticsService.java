package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.model.VendorExpense;
import com.finance.expenseanalyzer.model.RevenueInvoice;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.VendorExpenseRepository;
import com.finance.expenseanalyzer.repository.RevenueInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final VendorExpenseRepository expenseRepository;
    private final RevenueInvoiceRepository invoiceRepository;

    public List<Map<String, Object>> getMonthlyAnalytics(User user, int months) {
        List<VendorExpense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());
        List<RevenueInvoice> invoices = invoiceRepository.findByUserIdOrderByDateDesc(user.getId());

        List<Map<String, Object>> results = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = months - 1; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            int year = targetDate.getYear();
            int monthValue = targetDate.getMonthValue();
            String monthName = targetDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            double monthlyRevenue = invoices.stream()
                    .filter(inv -> inv.getDate().getYear() == year && inv.getDate().getMonthValue() == monthValue)
                    .mapToDouble(RevenueInvoice::getAmount)
                    .sum();

            double monthlyExpense = expenses.stream()
                    .filter(ex -> ex.getDate().getYear() == year && ex.getDate().getMonthValue() == monthValue)
                    .mapToDouble(VendorExpense::getAmount)
                    .sum();

            Map<String, Object> map = new HashMap<>();
            map.put("month", monthName + " " + year);
            map.put("totalIncome", monthlyRevenue);  // Kept as totalIncome for frontend compatibility
            map.put("totalExpense", monthlyExpense);
            results.add(map);
        }

        return results;
    }

    public List<Map<String, Object>> getCategoryAnalytics(User user) {
        List<VendorExpense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());
        
        Map<String, Double> categorySums = expenses.stream()
                .collect(Collectors.groupingBy(
                        VendorExpense::getCategory,
                        Collectors.summingDouble(VendorExpense::getAmount)
                ));

        return categorySums.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", entry.getKey());
            map.put("amount", entry.getValue());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getRunwayAnalytics(User user) {
        List<VendorExpense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());
        List<RevenueInvoice> invoices = invoiceRepository.findByUserIdOrderByDateDesc(user.getId());

        double totalRevenue = invoices.stream().mapToDouble(RevenueInvoice::getAmount).sum();
        double totalExpense = expenses.stream().mapToDouble(VendorExpense::getAmount).sum();

        // Cash buffer is cumulative revenue minus cumulative expenses
        double cashBuffer = Math.max(50000.0, totalRevenue - totalExpense);

        // Average monthly burn (expenses in the current & previous month)
        LocalDate startOfPrevMonth = LocalDate.now().minusMonths(1).withDayOfMonth(1);
        double recentExpenses = expenses.stream()
                .filter(e -> !e.getDate().isBefore(startOfPrevMonth))
                .mapToDouble(VendorExpense::getAmount)
                .sum();
        
        double monthlyBurnRate = Math.max(1000.0, recentExpenses / 2.0);
        double runwayMonths = cashBuffer / monthlyBurnRate;

        Map<String, Object> map = new HashMap<>();
        map.put("cashBuffer", cashBuffer);
        map.put("monthlyBurnRate", monthlyBurnRate);
        map.put("runwayMonths", runwayMonths);
        return map;
    }
}
