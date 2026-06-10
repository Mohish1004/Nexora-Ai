package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.RunwayGoalDto;
import com.finance.expenseanalyzer.model.RunwayGoal;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.RunwayGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RunwayGoalService {

    private final RunwayGoalRepository goalRepository;

    public List<RunwayGoalDto> getAll(User user) {
        return goalRepository.findByUserId(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public RunwayGoalDto create(User user, RunwayGoalDto dto) {
        RunwayGoal goal = RunwayGoal.builder()
                .user(user)
                .name(dto.getName())
                .targetAmount(dto.getTargetAmount())
                .currentAmount(dto.getCurrentAmount())
                .build();
        return toDto(goalRepository.save(goal));
    }

    public RunwayGoalDto update(Long id, RunwayGoalDto dto) {
        RunwayGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));
        goal.setName(dto.getName());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setCurrentAmount(dto.getCurrentAmount());
        return toDto(goalRepository.save(goal));
    }

    public void delete(Long id) {
        goalRepository.deleteById(id);
    }

    private RunwayGoalDto toDto(RunwayGoal goal) {
        return RunwayGoalDto.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .build();
    }
}
