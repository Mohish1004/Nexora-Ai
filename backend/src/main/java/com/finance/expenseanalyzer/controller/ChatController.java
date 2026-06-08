package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.ChatMessageDto;
import com.finance.expenseanalyzer.dto.ChatSessionDto;
import com.finance.expenseanalyzer.dto.MessageResponse;
import com.finance.expenseanalyzer.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping
    public ResponseEntity<List<ChatSessionDto>> getActiveSessions() {
        return ResponseEntity.ok(chatService.getActiveSessions());
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<ChatSessionDto>> getDeletedSessions() {
        return ResponseEntity.ok(chatService.getDeletedSessions());
    }

    @PostMapping
    public ResponseEntity<ChatSessionDto> createSession(@RequestParam(required = false) String title, @RequestParam(required = false) String mode) {
        return ResponseEntity.ok(chatService.createSession(title, mode));
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageDto>> getMessages(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatService.getMessages(sessionId));
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ChatMessageDto> appendMessage(@PathVariable Long sessionId, @RequestBody ChatMessageDto messageDto) {
        return ResponseEntity.ok(chatService.appendMessage(sessionId, messageDto));
    }

    @PutMapping("/{sessionId}/rename")
    public ResponseEntity<ChatSessionDto> renameSession(@PathVariable Long sessionId, @RequestParam String title) {
        return ResponseEntity.ok(chatService.renameSession(sessionId, title));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(@PathVariable Long sessionId) {
        chatService.softDeleteSession(sessionId);
        return ResponseEntity.ok(new MessageResponse("Chat session deleted successfully"));
    }

    @PostMapping("/{sessionId}/restore")
    public ResponseEntity<ChatSessionDto> restoreSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(chatService.restoreSession(sessionId));
    }
}
