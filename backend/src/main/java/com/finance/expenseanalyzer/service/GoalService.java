package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.GoalDto;
import com.finance.expenseanalyzer.model.Goal;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.GoalRepository;
import com.finance.expenseanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user found in context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public List<GoalDto> getAllGoals() {
        User user = getCurrentUser();
        return goalRepository.findByUserIdOrderByDeadlineAsc(user.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public GoalDto saveGoal(GoalDto goalDto) {
        User user = getCurrentUser();
        Goal goal = Goal.builder()
                .user(user)
                .name(goalDto.getName())
                .targetAmount(goalDto.getTargetAmount())
                .currentAmount(goalDto.getCurrentAmount())
                .deadline(goalDto.getDeadline())
                .category(goalDto.getCategory())
                .build();
        return mapToDto(goalRepository.save(goal));
    }

    public GoalDto updateGoal(Long goalId, GoalDto goalDto) {
        User user = getCurrentUser();
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this goal");
        }

        goal.setName(goalDto.getName());
        goal.setTargetAmount(goalDto.getTargetAmount());
        goal.setCurrentAmount(goalDto.getCurrentAmount());
        goal.setDeadline(goalDto.getDeadline());
        goal.setCategory(goalDto.getCategory());

        return mapToDto(goalRepository.save(goal));
    }

    public void deleteGoal(Long goalId) {
        User user = getCurrentUser();
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found with id: " + goalId));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this goal");
        }

        goalRepository.delete(goal);
    }

    private GoalDto mapToDto(Goal goal) {
        return GoalDto.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .deadline(goal.getDeadline())
                .category(goal.getCategory())
                .build();
    }
}
