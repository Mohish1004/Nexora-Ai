package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.IncomeDto;
import com.finance.expenseanalyzer.dto.MessageResponse;
import com.finance.expenseanalyzer.service.IncomeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeService incomeService;

    @GetMapping
    public ResponseEntity<List<IncomeDto>> getAllIncome() {
        return ResponseEntity.ok(incomeService.getAllIncome());
    }

    @PostMapping
    public ResponseEntity<IncomeDto> createIncome(@Valid @RequestBody IncomeDto incomeDto) {
        return ResponseEntity.ok(incomeService.createIncome(incomeDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.ok(new MessageResponse("Income deleted successfully"));
    }
}
