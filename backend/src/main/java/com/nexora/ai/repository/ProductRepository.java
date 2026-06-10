package com.nexora.ai.repository;

import com.nexora.ai.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByWorkspaceId(Long workspaceId);
    Optional<Product> findByIdAndWorkspaceId(Long id, Long workspaceId);
    
    @Query("SELECT p FROM Product p WHERE p.workspace.id = :workspaceId AND p.quantity <= p.threshold")
    List<Product> findLowStockProducts(@Param("workspaceId") Long workspaceId);

    @Query("SELECT SUM(p.quantity * p.purchasePrice) FROM Product p WHERE p.workspace.id = :workspaceId")
    BigDecimal calculateTotalInventoryValue(@Param("workspaceId") Long workspaceId);
}
