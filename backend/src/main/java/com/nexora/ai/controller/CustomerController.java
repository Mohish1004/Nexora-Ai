package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.CustomerRequest;
import com.nexora.ai.dto.CustomerResponse;
import com.nexora.ai.entity.Customer;
import com.nexora.ai.service.LedgerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/customers")
public class CustomerController {

    private final LedgerService ledgerService;

    public CustomerController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    private CustomerResponse mapToResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId())
                .workspaceId(c.getWorkspace().getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .outstandingBalance(c.getOutstandingBalance())
                .build();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getCustomers(
            Principal principal,
            @PathVariable Long workspaceId) {
        List<Customer> customers = ledgerService.getCustomers(principal.getName(), workspaceId);
        List<CustomerResponse> response = customers.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            Principal principal,
            @PathVariable Long workspaceId,
            @Valid @RequestBody CustomerRequest request) {
        Customer c = ledgerService.createCustomer(principal.getName(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Customer created successfully", mapToResponse(c)));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long customerId) {
        Customer c = ledgerService.getCustomer(principal.getName(), workspaceId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer retrieved successfully", mapToResponse(c)));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long customerId,
            @Valid @RequestBody CustomerRequest request) {
        Customer c = ledgerService.updateCustomer(principal.getName(), workspaceId, customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", mapToResponse(c)));
    }

    @DeleteMapping("/{customerId}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long customerId) {
        ledgerService.deleteCustomer(principal.getName(), workspaceId, customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully"));
    }
}
