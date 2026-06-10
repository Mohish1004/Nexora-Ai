package com.nexora.ai.service;

import com.nexora.ai.dto.ProductRequest;
import com.nexora.ai.entity.Product;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryService {

    private final ProductRepository productRepository;
    private final WorkspaceService workspaceService;

    public InventoryService(ProductRepository productRepository, WorkspaceService workspaceService) {
        this.productRepository = productRepository;
        this.workspaceService = workspaceService;
    }

    private Workspace verifyAndGetWorkspace(String email, Long workspaceId) {
        return workspaceService.getWorkspaceForUser(email, workspaceId);
    }

    public List<Product> getProducts(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        return productRepository.findByWorkspaceId(workspaceId);
    }

    public Product getProduct(String email, Long workspaceId, Long productId) {
        verifyAndGetWorkspace(email, workspaceId);
        return productRepository.findByIdAndWorkspaceId(productId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in this workspace"));
    }

    @Transactional
    @CacheEvict(value = "businessDashboard", key = "#workspaceId")
    public Product createProduct(String email, Long workspaceId, ProductRequest request) {
        Workspace workspace = verifyAndGetWorkspace(email, workspaceId);
        
        Product product = Product.builder()
                .workspace(workspace)
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .threshold(request.getThreshold())
                .purchasePrice(request.getPurchasePrice())
                .sellingPrice(request.getSellingPrice())
                .build();
                
        return productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = "businessDashboard", key = "#workspaceId")
    public Product updateProduct(String email, Long workspaceId, Long productId, ProductRequest request) {
        verifyAndGetWorkspace(email, workspaceId);
        Product product = productRepository.findByIdAndWorkspaceId(productId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setCategory(request.getCategory());
        product.setQuantity(request.getQuantity());
        product.setThreshold(request.getThreshold());
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());

        return productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = "businessDashboard", key = "#workspaceId")
    public void deleteProduct(String email, Long workspaceId, Long productId) {
        verifyAndGetWorkspace(email, workspaceId);
        Product product = productRepository.findByIdAndWorkspaceId(productId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        productRepository.delete(product);
    }

    public BigDecimal getTotalInventoryValue(String email, Long workspaceId) {
        verifyAndGetWorkspace(email, workspaceId);
        BigDecimal value = productRepository.calculateTotalInventoryValue(workspaceId);
        return value != null ? value : BigDecimal.ZERO;
    }
}
