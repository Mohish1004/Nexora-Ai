package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.DepartmentBudgetDto;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.DepartmentBudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class DepartmentBudgetController {

    private final DepartmentBudgetService budgetService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<DepartmentBudgetDto>> getAll() {
        return ResponseEntity.ok(budgetService.getAll(getCurrentUser()));
    }

    @GetMapping("/{month}")
    public ResponseEntity<DepartmentBudgetDto> getForMonth(@PathVariable String month) {
        return ResponseEntity.ok(budgetService.getForMonth(getCurrentUser(), month));
    }

    @PostMapping
    public ResponseEntity<DepartmentBudgetDto> setBudget(@RequestBody DepartmentBudgetDto dto) {
        return ResponseEntity.ok(budgetService.setBudget(getCurrentUser(), dto));
    }
}
