package com.nexora.ai.repository;

import com.nexora.ai.entity.ReceivablesPayables;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceivablesPayablesRepository extends JpaRepository<ReceivablesPayables, Long> {
    List<ReceivablesPayables> findByWorkspaceId(Long workspaceId);
    Optional<ReceivablesPayables> findByIdAndWorkspaceId(Long id, Long workspaceId);
    
    @Query("SELECT SUM(rp.amount) FROM ReceivablesPayables rp WHERE rp.workspace.id = :workspaceId AND rp.type = :type AND rp.status IN :statuses")
    BigDecimal sumAmountByWorkspaceIdAndTypeAndStatusIn(
            @Param("workspaceId") Long workspaceId, 
            @Param("type") String type, 
            @Param("statuses") List<String> statuses
    );

    List<ReceivablesPayables> findByStatusAndDueDateBefore(String status, LocalDate date);
}
