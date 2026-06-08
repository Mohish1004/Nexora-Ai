package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.ChatMessageDto;
import com.finance.expenseanalyzer.dto.ChatSessionDto;
import com.finance.expenseanalyzer.model.ChatMessage;
import com.finance.expenseanalyzer.model.ChatSession;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.ChatMessageRepository;
import com.finance.expenseanalyzer.repository.ChatSessionRepository;
import com.finance.expenseanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user found in context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getActiveSessions() {
        User user = getCurrentUser();
        return chatSessionRepository.findByUserIdAndDeletedFalseOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::mapToSessionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDto> getDeletedSessions() {
        User user = getCurrentUser();
        return chatSessionRepository.findByUserIdAndDeletedTrueOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::mapToSessionDto)
                .collect(Collectors.toList());
    }

    public ChatSessionDto createSession(String title, String mode) {
        User user = getCurrentUser();
        ChatSession session = ChatSession.builder()
                .title(title != null ? title : "New Chat")
                .mode(mode != null ? mode : "advisor")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .deleted(false)
                .user(user)
                .build();
        return mapToSessionDto(chatSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getMessages(Long sessionId) {
        User user = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access this chat session");
        }

        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }

    public ChatMessageDto appendMessage(Long sessionId, ChatMessageDto messageDto) {
        if (messageDto == null) {
            throw new IllegalArgumentException("Message data cannot be null");
        }
        User user = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access this chat session");
        }

        ChatMessage message = ChatMessage.builder()
                .sender(messageDto.getSender())
                .text(messageDto.getText())
                .createdAt(LocalDateTime.now())
                .session(session)
                .build();

        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        return mapToMessageDto(chatMessageRepository.save(Objects.requireNonNull(message)));
    }

    public ChatSessionDto renameSession(Long sessionId, String newTitle) {
        User user = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to rename this chat session");
        }

        session.setTitle(newTitle);
        session.setUpdatedAt(LocalDateTime.now());
        return mapToSessionDto(chatSessionRepository.save(session));
    }

    public void softDeleteSession(Long sessionId) {
        User user = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this chat session");
        }

        session.setDeleted(true);
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);
    }

    public ChatSessionDto restoreSession(Long sessionId) {
        User user = getCurrentUser();
        ChatSession session = chatSessionRepository.findById(Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to restore this chat session");
        }

        session.setDeleted(false);
        session.setUpdatedAt(LocalDateTime.now());
        return mapToSessionDto(chatSessionRepository.save(session));
    }

    private ChatSessionDto mapToSessionDto(ChatSession session) {
        return ChatSessionDto.builder()
                .id(session.getId())
                .title(session.getTitle())
                .mode(session.getMode())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private ChatMessageDto mapToMessageDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .sender(message.getSender())
                .text(message.getText())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
