package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.GoalDto;
import com.finance.expenseanalyzer.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    public ResponseEntity<List<GoalDto>> getAllGoals() {
        return ResponseEntity.ok(goalService.getAllGoals());
    }

    @PostMapping
    public ResponseEntity<GoalDto> createGoal(@Valid @RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.saveGoal(goalDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDto> updateGoal(@PathVariable Long id, @Valid @RequestBody GoalDto goalDto) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        goalService.deleteGoal(id);
        return ResponseEntity.noContent().build();
    }
}
