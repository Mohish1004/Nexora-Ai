package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.VendorExpenseDto;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.VendorExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class VendorExpenseController {

    private final VendorExpenseService expenseService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<VendorExpenseDto>> getAll() {
        return ResponseEntity.ok(expenseService.getAll(getCurrentUser()));
    }

    @PostMapping
    public ResponseEntity<VendorExpenseDto> create(@RequestBody VendorExpenseDto dto) {
        return ResponseEntity.ok(expenseService.create(getCurrentUser(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorExpenseDto> update(@PathVariable Long id, @RequestBody VendorExpenseDto dto) {
        return ResponseEntity.ok(expenseService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        expenseService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Expense record deleted successfully"));
    }
}
