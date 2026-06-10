package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.ProductRequest;
import com.nexora.ai.dto.ProductResponse;
import com.nexora.ai.entity.Product;
import com.nexora.ai.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/products")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    private ProductResponse mapToResponse(Product p) {
        BigDecimal totalValue = p.getPurchasePrice().multiply(BigDecimal.valueOf(p.getQuantity()));
        boolean lowStock = p.getQuantity() <= p.getThreshold();
        
        return ProductResponse.builder()
                .id(p.getId())
                .workspaceId(p.getWorkspace().getId())
                .name(p.getName())
                .sku(p.getSku())
                .category(p.getCategory())
                .quantity(p.getQuantity())
                .threshold(p.getThreshold())
                .purchasePrice(p.getPurchasePrice())
                .sellingPrice(p.getSellingPrice())
                .totalValue(totalValue)
                .lowStock(lowStock)
                .build();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts(
            Principal principal,
            @PathVariable Long workspaceId) {
        List<Product> products = inventoryService.getProducts(principal.getName(), workspaceId);
        List<ProductResponse> response = products.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            Principal principal,
            @PathVariable Long workspaceId,
            @Valid @RequestBody ProductRequest request) {
        Product p = inventoryService.createProduct(principal.getName(), workspaceId, request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", mapToResponse(p)));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long productId) {
        Product p = inventoryService.getProduct(principal.getName(), workspaceId, productId);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", mapToResponse(p)));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long productId,
            @Valid @RequestBody ProductRequest request) {
        Product p = inventoryService.updateProduct(principal.getName(), workspaceId, productId, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", mapToResponse(p)));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            Principal principal,
            @PathVariable Long workspaceId,
            @PathVariable Long productId) {
        inventoryService.deleteProduct(principal.getName(), workspaceId, productId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    @GetMapping("/valuation")
    public ResponseEntity<ApiResponse<BigDecimal>> getValuation(
            Principal principal,
            @PathVariable Long workspaceId) {
        BigDecimal valuation = inventoryService.getTotalInventoryValue(principal.getName(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Inventory valuation retrieved successfully", valuation));
    }
}
