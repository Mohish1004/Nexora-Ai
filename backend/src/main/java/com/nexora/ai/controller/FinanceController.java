package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.ReceivablesPayablesRequest;
import com.nexora.ai.dto.ReceivablesPayablesResponse;
import com.nexora.ai.dto.TransactionRequest;
import com.nexora.ai.dto.TransactionResponse;
import com.nexora.ai.entity.ReceivablesPayables;
import com.nexora.ai.entity.Transaction;
import com.nexora.ai.service.FinanceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .workspaceId(t.getWorkspace().getId())
                .type(t.getType())
                .amount(t.getAmount())
                .category(t.getCategory())
                .date(t.getDate())
                .description(t.getDescription())
                .build();
    }

    private ReceivablesPayablesResponse mapToResponse(ReceivablesPayables rp) {
        return ReceivablesPayablesResponse.builder()
                .id(rp.getId())
                .workspaceId(rp.getWorkspace().getId())
                .type(rp.getType())
                .partyName(rp.getPartyName())
                .amount(rp.getAmount())
                .dueDate(rp.getDueDate())
                .status(rp.getStatus())
                .build();
    }

    // --- Transactions ---

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            Principal principal,
            @PathVariable Long workspaceId) {
        List<Transaction> list = financeService.getTransactions(principal.getName(), workspaceId);
        List<TransactionResponse> response = list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Transactions retrieved successfully", response));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            Principal principal,
            @PathVariable Long workspaceId,
            @Valid @RequestBody TransactionRequest request) {
        Transaction t = financeService.createTransaction(principal.getName(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded successfully", mapToResponse(t)));
    }

    // --- Receivables & Payables ---

    @GetMapping("/receivables-payables")
    public ResponseEntity<ApiResponse<List<ReceivablesPayablesResponse>>> getReceivablesPayables(
            Principal principal,
            @PathVariable Long workspaceId) {
        List<ReceivablesPayables> list = financeService.getReceivablesPayables(principal.getName(), workspaceId);
        List<ReceivablesPayablesResponse> response = list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Receivables and payables retrieved successfully", response));
    }

    @PostMapping("/receivables-payables")
    public ResponseEntity<ApiResponse<ReceivablesPayablesResponse>> createReceivablesPayables(
            Principal principal,
            @PathVariable Long workspaceId,
            @Valid @RequestBody ReceivablesPayablesRequest request) {
        ReceivablesPayables rp = financeService.createReceivablesPayables(principal.getName(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment tracker created successfully", mapToResponse(rp)));
    }

    @PatchMapping("/receivables-payables/{id}/status")
    public ResponseEntity<ApiResponse<ReceivablesPayablesResponse>> updateStatus(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long id,
            @RequestParam String status) {
        ReceivablesPayables rp = financeService.updateStatus(principal.getName(), workspaceId, id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", mapToResponse(rp)));
    }
}
