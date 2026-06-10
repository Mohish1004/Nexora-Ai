package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.UserRepository;
import com.finance.expenseanalyzer.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyAnalytics(
            @RequestParam(required = false, defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyAnalytics(getCurrentUser(), months));
    }

    @GetMapping("/category")
    public ResponseEntity<List<Map<String, Object>>> getCategoryAnalytics() {
        return ResponseEntity.ok(analyticsService.getCategoryAnalytics(getCurrentUser()));
    }

    @GetMapping("/runway")
    public ResponseEntity<Map<String, Object>> getRunwayAnalytics() {
        return ResponseEntity.ok(analyticsService.getRunwayAnalytics(getCurrentUser()));
    }
}
