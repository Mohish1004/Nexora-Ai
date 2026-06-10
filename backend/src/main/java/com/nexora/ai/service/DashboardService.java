package com.nexora.ai.service;

import com.nexora.ai.dto.BusinessDashboardResponse;
import com.nexora.ai.dto.PersonalDashboardResponse;
import com.nexora.ai.dto.TransactionResponse;
import com.nexora.ai.entity.Transaction;
import com.nexora.ai.repository.ProductRepository;
import com.nexora.ai.repository.ReceivablesPayablesRepository;
import com.nexora.ai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final ReceivablesPayablesRepository receivablesPayablesRepository;
    private final TransactionRepository transactionRepository;
    private final WorkspaceService workspaceService;

    public DashboardService(
            ProductRepository productRepository,
            ReceivablesPayablesRepository receivablesPayablesRepository,
            TransactionRepository transactionRepository,
            WorkspaceService workspaceService) {
        this.productRepository = productRepository;
        this.receivablesPayablesRepository = receivablesPayablesRepository;
        this.transactionRepository = transactionRepository;
        this.workspaceService = workspaceService;
    }

    private List<TransactionResponse> getRecentTransactions(Long workspaceId) {
        List<Transaction> transactions = transactionRepository.findByWorkspaceId(workspaceId);
        // Sort descending by date
        return transactions.stream()
                .sorted((t1, t2) -> t2.getDate().compareTo(t1.getDate()))
                .limit(5)
                .map(t -> TransactionResponse.builder()
                        .id(t.getId())
                        .workspaceId(t.getWorkspace().getId())
                        .type(t.getType())
                        .amount(t.getAmount())
                        .category(t.getCategory())
                        .date(t.getDate())
                        .description(t.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    public BusinessDashboardResponse getBusinessDashboard(String email, Long workspaceId) {
        workspaceService.getWorkspaceForUser(email, workspaceId);

        BigDecimal inventoryValue = productRepository.calculateTotalInventoryValue(workspaceId);
        if (inventoryValue == null) inventoryValue = BigDecimal.ZERO;

        BigDecimal totalReceivables = receivablesPayablesRepository.sumAmountByWorkspaceIdAndTypeAndStatusIn(
                workspaceId, "RECEIVABLE", Arrays.asList("PENDING", "OVERDUE")
        );
        if (totalReceivables == null) totalReceivables = BigDecimal.ZERO;

        BigDecimal totalPayables = receivablesPayablesRepository.sumAmountByWorkspaceIdAndTypeAndStatusIn(
                workspaceId, "PAYABLE", Arrays.asList("PENDING", "OVERDUE")
        );
        if (totalPayables == null) totalPayables = BigDecimal.ZERO;

        BigDecimal totalIncome = transactionRepository.sumAmountByWorkspaceIdAndType(workspaceId, "INCOME");
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = transactionRepository.sumAmountByWorkspaceIdAndType(workspaceId, "EXPENSE");
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal netProfit = totalIncome.subtract(totalExpenses);

        long lowStockCount = productRepository.findLowStockProducts(workspaceId).size();

        return BusinessDashboardResponse.builder()
                .inventoryValue(inventoryValue)
                .totalReceivables(totalReceivables)
                .totalPayables(totalPayables)
                .netProfit(netProfit)
                .lowStockCount(lowStockCount)
                .recentTransactions(getRecentTransactions(workspaceId))
                .build();
    }

    public PersonalDashboardResponse getPersonalDashboard(String email, Long workspaceId) {
        workspaceService.getWorkspaceForUser(email, workspaceId);

        BigDecimal totalIncome = transactionRepository.sumAmountByWorkspaceIdAndType(workspaceId, "INCOME");
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpenses = transactionRepository.sumAmountByWorkspaceIdAndType(workspaceId, "EXPENSE");
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal currentBalance = totalIncome.subtract(totalExpenses);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal savings = totalIncome.subtract(totalExpenses);
            savingsRate = savings.multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP);
        }

        return PersonalDashboardResponse.builder()
                .currentBalance(currentBalance)
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .savingsRate(savingsRate)
                .recentTransactions(getRecentTransactions(workspaceId))
                .build();
    }
}
