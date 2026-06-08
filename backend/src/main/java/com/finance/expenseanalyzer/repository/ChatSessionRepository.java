package com.finance.expenseanalyzer.repository;

import com.finance.expenseanalyzer.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserIdAndDeletedFalseOrderByUpdatedAtDesc(Long userId);
    List<ChatSession> findByUserIdAndDeletedTrueOrderByUpdatedAtDesc(Long userId);
}
