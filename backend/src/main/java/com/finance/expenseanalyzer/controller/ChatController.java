package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.ChatMessageDto;
import com.finance.expenseanalyzer.dto.ChatSessionDto;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<ChatSessionDto>> getActiveSessions() {
        return ResponseEntity.ok(chatService.getActiveSessions(getCurrentUser()));
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<ChatSessionDto>> getDeletedSessions() {
        return ResponseEntity.ok(chatService.getDeletedSessions(getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<ChatSessionDto> createSession(
            @RequestParam(required = false, defaultValue = "") String title,
            @RequestParam(required = false, defaultValue = "") String mode) {
        return ResponseEntity.ok(chatService.createSession(getCurrentUser(), title, mode));
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatService.getMessages(sessionId));
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ChatMessageDto> appendMessage(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> payload) {
        String sender = payload.get("sender");
        String text = payload.get("text");
        return ResponseEntity.ok(chatService.appendMessage(sessionId, sender, text));
    }

    @PutMapping("/{sessionId}/rename")
    public ResponseEntity<ChatSessionDto> renameSession(
            @PathVariable Long sessionId,
            @RequestParam String title) {
        return ResponseEntity.ok(chatService.renameSession(sessionId, title));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable Long sessionId) {
        chatService.deleteSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Session deleted successfully"));
    }

    @PostMapping("/{sessionId}/restore")
    public ResponseEntity<Map<String, String>> restoreSession(@PathVariable Long sessionId) {
        chatService.restoreSession(sessionId);
        return ResponseEntity.ok(Map.of("message", "Session restored successfully"));
    }
}
