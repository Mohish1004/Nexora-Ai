package com.nexora.ai.repository;

import com.nexora.ai.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWorkspaceId(Long workspaceId);
    Optional<Transaction> findByIdAndWorkspaceId(Long id, Long workspaceId);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.workspace.id = :workspaceId AND t.type = :type")
    BigDecimal sumAmountByWorkspaceIdAndType(@Param("workspaceId") Long workspaceId, @Param("type") String type);
}
