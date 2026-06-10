package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.RunwayGoalDto;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.RunwayGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class RunwayGoalController {

    private final RunwayGoalService goalService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<RunwayGoalDto>> getAll() {
        return ResponseEntity.ok(goalService.getAll(getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<RunwayGoalDto> create(@RequestBody RunwayGoalDto dto) {
        return ResponseEntity.ok(goalService.create(getCurrentUser(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RunwayGoalDto> update(@PathVariable Long id, @RequestBody RunwayGoalDto dto) {
        return ResponseEntity.ok(goalService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        goalService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Runway goal deleted successfully"));
    }
}
