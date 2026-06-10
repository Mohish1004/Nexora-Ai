package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.DepartmentBudgetDto;
import com.finance.expenseanalyzer.model.DepartmentBudget;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.DepartmentBudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DepartmentBudgetService {

    private final DepartmentBudgetRepository budgetRepository;

    public List<DepartmentBudgetDto> getAll(User user) {
        return budgetRepository.findByUserIdOrderByMonthDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public DepartmentBudgetDto getForMonth(User user, String month) {
        return budgetRepository.findByUserIdAndMonth(user.getId(), month)
                .map(this::toDto)
                .orElse(DepartmentBudgetDto.builder().monthlyLimit(0.0).month(month).build());
    }

    public DepartmentBudgetDto setBudget(User user, DepartmentBudgetDto dto) {
        Optional<DepartmentBudget> existing = budgetRepository.findByUserIdAndMonth(user.getId(), dto.getMonth());
        DepartmentBudget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setMonthlyLimit(dto.getMonthlyLimit());
        } else {
            budget = DepartmentBudget.builder()
                    .user(user)
                    .monthlyLimit(dto.getMonthlyLimit())
                    .month(dto.getMonth())
                    .build();
        }
        return toDto(budgetRepository.save(budget));
    }

    private DepartmentBudgetDto toDto(DepartmentBudget budget) {
        return DepartmentBudgetDto.builder()
                .id(budget.getId())
                .monthlyLimit(budget.getMonthlyLimit())
                .month(budget.getMonth())
                .build();
    }
}
