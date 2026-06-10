package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.model.*;
import com.finance.expenseanalyzer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VendorExpenseRepository expenseRepository;
    private final RevenueInvoiceRepository invoiceRepository;
    private final DepartmentBudgetRepository budgetRepository;
    private final RunwayGoalRepository goalRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed corporate user
            User demoUser = Objects.requireNonNull(User.builder()
                    .name("CEO & Founder")
                    .email("ceo@centric.ai")
                    .password(passwordEncoder.encode("password"))
                    .provider("local")
                    .build());

            userRepository.save(demoUser);

            // Seed Revenue Invoices
            LocalDate now = LocalDate.now();
            invoiceRepository.save(Objects.requireNonNull(RevenueInvoice.builder().user(demoUser).clientName("Acme Corp Retainer").amount(180000.0).date(now.withDayOfMonth(1)).status("PAID").build()));
            invoiceRepository.save(Objects.requireNonNull(RevenueInvoice.builder().user(demoUser).clientName("BetaTech Licensing").amount(120000.0).date(now.minusDays(5)).status("PAID").build()));
            invoiceRepository.save(Objects.requireNonNull(RevenueInvoice.builder().user(demoUser).clientName("OmniCorp consulting").amount(85000.0).date(now.minusDays(15)).status("PENDING").build()));
            
            // Previous month revenue
            invoiceRepository.save(Objects.requireNonNull(RevenueInvoice.builder().user(demoUser).clientName("Acme Corp Retainer").amount(180000.0).date(now.minusMonths(1).withDayOfMonth(1)).status("PAID").build()));
            invoiceRepository.save(Objects.requireNonNull(RevenueInvoice.builder().user(demoUser).clientName("BetaTech Licensing").amount(110000.0).date(now.minusMonths(1).minusDays(10)).status("PAID").build()));

            // Seed Department Budgets
            String currentMonthStr = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String prevMonthStr = YearMonth.now().minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"));
            
            budgetRepository.save(Objects.requireNonNull(DepartmentBudget.builder().user(demoUser).monthlyLimit(450000.0).month(currentMonthStr).build()));
            budgetRepository.save(Objects.requireNonNull(DepartmentBudget.builder().user(demoUser).monthlyLimit(400000.0).month(prevMonthStr).build()));

            // Seed Vendor Expenses
            // Current Month
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Amazon Web Services").category("Infrastructure").amount(45000.0).description("AWS EC2 & Aurora Cluster Production hosting").date(now.minusDays(2)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Meta Platforms").category("Marketing").amount(75000.0).description("Social media client acquisition campaign").date(now.minusDays(4)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Slack Technologies").category("SaaS & Software").amount(12000.0).description("Slack corporate chat premium seats").date(now.minusDays(7)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("GitHub Inc.").category("SaaS & Software").amount(8000.0).description("GitHub Enterprise Organization plan").date(now.minusDays(10)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("WeWork Space").category("Office & Operations").amount(95000.0).description("Monthly central executive workspace rent").date(now.minusDays(12)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("DevContractor").category("Payroll & Contractors").amount(140000.0).description("Monthly senior developer contractor fee").date(now.minusDays(15)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Salesforce Corp").category("SaaS & Software").amount(35000.0).description("Sales CRM enterprise seats").date(now.minusDays(18)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Indigo Airlines").category("Travel & Meals").amount(22000.0).description("Flight tickets for Q3 sales convention").date(now.minusDays(20)).build()));

            // Previous Month
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Amazon Web Services").category("Infrastructure").amount(42000.0).description("AWS Core hosting").date(now.minusMonths(1).minusDays(2)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("Google Ads").category("Marketing").amount(68000.0).description("Search engine acquisition ads").date(now.minusMonths(1).minusDays(5)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("WeWork Space").category("Office & Operations").amount(95000.0).description("Executive rent").date(now.minusMonths(1).minusDays(12)).build()));
            expenseRepository.save(Objects.requireNonNull(VendorExpense.builder().user(demoUser).vendor("DevContractor").category("Payroll & Contractors").amount(140000.0).description("Dev contractor").date(now.minusMonths(1).minusDays(15)).build()));

            // Seed Runway Goals
            goalRepository.save(Objects.requireNonNull(RunwayGoal.builder().user(demoUser).name("6-Month Runway Reserve").targetAmount(1000000.0).currentAmount(450000.0).build()));
            goalRepository.save(Objects.requireNonNull(RunwayGoal.builder().user(demoUser).name("R&D Expansion Target").targetAmount(500000.0).currentAmount(150000.0).build()));
        }
    }
}
