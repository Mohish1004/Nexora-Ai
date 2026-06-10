package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.VendorRequest;
import com.nexora.ai.dto.VendorResponse;
import com.nexora.ai.entity.Vendor;
import com.nexora.ai.service.LedgerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/vendors")
public class VendorController {

    private final LedgerService ledgerService;

    public VendorController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    private VendorResponse mapToResponse(Vendor v) {
        return VendorResponse.builder()
                .id(v.getId())
                .workspaceId(v.getWorkspace().getId())
                .name(v.getName())
                .email(v.getEmail())
                .phone(v.getPhone())
                .amountOwed(v.getAmountOwed())
                .build();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VendorResponse>>> getVendors(
            Principal principal,
            @PathVariable Long workspaceId) {
        List<Vendor> vendors = ledgerService.getVendors(principal.getName(), workspaceId);
        List<VendorResponse> response = vendors.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VendorResponse>> createVendor(
            Principal principal,
            @PathVariable Long workspaceId,
            @Valid @RequestBody VendorRequest request) {
        Vendor v = ledgerService.createVendor(principal.getName(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Vendor created successfully", mapToResponse(v)));
    }

    @GetMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<VendorResponse>> getVendor(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long vendorId) {
        Vendor v = ledgerService.getVendor(principal.getName(), workspaceId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor retrieved successfully", mapToResponse(v)));
    }

    @PutMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<VendorResponse>> updateVendor(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long vendorId,
            @Valid @RequestBody VendorRequest request) {
        Vendor v = ledgerService.updateVendor(principal.getName(), workspaceId, vendorId, request);
        return ResponseEntity.ok(ApiResponse.success("Vendor updated successfully", mapToResponse(v)));
    }

    @DeleteMapping("/{vendorId}")
    public ResponseEntity<ApiResponse<Void>> deleteVendor(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long vendorId) {
        ledgerService.deleteVendor(principal.getName(), workspaceId, vendorId);
        return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully"));
    }
}
