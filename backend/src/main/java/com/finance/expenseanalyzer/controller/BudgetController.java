package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.BudgetDto;
import com.finance.expenseanalyzer.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getAllBudgets() {
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @GetMapping("/{month}")
    public ResponseEntity<BudgetDto> getBudgetForMonth(@PathVariable String month) {
        return ResponseEntity.ok(budgetService.getBudgetForMonth(month));
    }

    @PostMapping
    public ResponseEntity<BudgetDto> setBudget(@Valid @RequestBody BudgetDto budgetDto) {
        return ResponseEntity.ok(budgetService.saveOrUpdateBudget(budgetDto));
    }
}
