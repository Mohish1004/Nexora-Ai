package com.nexora.ai.service;

import com.nexora.ai.dto.ReceivablesPayablesRequest;
import com.nexora.ai.dto.TransactionRequest;
import com.nexora.ai.entity.ReceivablesPayables;
import com.nexora.ai.entity.Transaction;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.ReceivablesPayablesRepository;
import com.nexora.ai.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FinanceService {

    private final TransactionRepository transactionRepository;
    private final ReceivablesPayablesRepository receivablesPayablesRepository;
    private final WorkspaceService workspaceService;

    public FinanceService(
            TransactionRepository transactionRepository,
            ReceivablesPayablesRepository receivablesPayablesRepository,
            WorkspaceService workspaceService) {
        this.transactionRepository = transactionRepository;
        this.receivablesPayablesRepository = receivablesPayablesRepository;
        this.workspaceService = workspaceService;
    }

    private Workspace verifyAndGetWorkspace(String email, Long workspaceId) {
        return workspaceService.getWorkspaceForUser(email, workspaceId);
    }

    // --- Transactions APIs ---

    public List<Transaction> getTransactions(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        return transactionRepository.findByWorkspaceId(workspaceId);
    }

    @Transactional
    public Transaction createTransaction(String email, Long workspaceId, TransactionRequest request) {
        Workspace workspace = verifyAndGetWorkspace(email, workspaceId);
        
        Transaction transaction = Transaction.builder()
                .workspace(workspace)
                .type(request.getType().toUpperCase())
                .amount(request.getAmount())
                .category(request.getCategory())
                .date(request.getDate())
                .description(request.getDescription())
                .build();
                
        return transactionRepository.save(transaction);
    }

    // --- Receivables & Payables APIs ---

    public List<ReceivablesPayables> getReceivablesPayables(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        return receivablesPayablesRepository.findByWorkspaceId(workspaceId);
    }

    @Transactional
    public ReceivablesPayables createReceivablesPayables(String email, Long workspaceId, ReceivablesPayablesRequest request) {
        Workspace workspace = verifyAndGetWorkspace(email, workspaceId);
        
        String status = request.getStatus();
        if (status == null || status.isBlank()) {
            status = request.getDueDate().isBefore(LocalDate.now()) ? "OVERDUE" : "PENDING";
        }
        
        ReceivablesPayables record = ReceivablesPayables.builder()
                .workspace(workspace)
                .type(request.getType().toUpperCase())
                .partyName(request.getPartyName())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .status(status.toUpperCase())
                .build();
                
        return receivablesPayablesRepository.save(record);
    }

    @Transactional
    public ReceivablesPayables updateStatus(String email, Long workspaceId, Long id, String status) {
        verifyAndGetWorkspace(email, workspaceId);
        ReceivablesPayables record = receivablesPayablesRepository.findByIdAndWorkspaceId(id, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Record not found"));
                
        record.setStatus(status.toUpperCase());
        return receivablesPayablesRepository.save(record);
    }
}
