package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.ChatMessageDto;
import com.finance.expenseanalyzer.dto.ChatSessionDto;
import com.finance.expenseanalyzer.model.ChatMessage;
import com.finance.expenseanalyzer.model.ChatSession;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.ChatMessageRepository;
import com.finance.expenseanalyzer.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;

    public List<ChatSessionDto> getActiveSessions(User user) {
        return sessionRepository.findByUserIdAndDeletedFalseOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toSessionDto).collect(Collectors.toList());
    }

    public List<ChatSessionDto> getDeletedSessions(User user) {
        return sessionRepository.findByUserIdAndDeletedTrueOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toSessionDto).collect(Collectors.toList());
    }

    public ChatSessionDto createSession(User user, String title, String mode) {
        ChatSession session = ChatSession.builder()
                .user(user)
                .title(title.isEmpty() ? "Business Advisory" : title)
                .mode(mode.isEmpty() ? "advisor" : mode)
                .build();
        return toSessionDto(sessionRepository.save(session));
    }

    public List<ChatMessageDto> getMessages(Long sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream().map(this::toMessageDto).collect(Collectors.toList());
    }

    public ChatMessageDto appendMessage(Long sessionId, String sender, String text) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        ChatMessage msg = ChatMessage.builder()
                .session(session)
                .sender(sender)
                .text(text)
                .build();
        return toMessageDto(messageRepository.save(msg));
    }

    public ChatSessionDto renameSession(Long sessionId, String title) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setTitle(title);
        return toSessionDto(sessionRepository.save(session));
    }

    public void deleteSession(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setDeleted(true);
        sessionRepository.save(session);
    }

    public void restoreSession(Long sessionId) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setDeleted(false);
        sessionRepository.save(session);
    }

    private ChatSessionDto toSessionDto(ChatSession s) {
        return ChatSessionDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .mode(s.getMode())
                .deleted(s.isDeleted())
                .createdAt(s.getCreatedAt())
                .build();
    }

    private ChatMessageDto toMessageDto(ChatMessage m) {
        return ChatMessageDto.builder()
                .id(m.getId())
                .sender(m.getSender())
                .text(m.getText())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
