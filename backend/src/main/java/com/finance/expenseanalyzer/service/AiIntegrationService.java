package com.finance.expenseanalyzer.service;

import com.finance.expenseanalyzer.dto.*;
import com.finance.expenseanalyzer.model.Expense;
import com.finance.expenseanalyzer.model.Income;
import com.finance.expenseanalyzer.model.User;
import com.finance.expenseanalyzer.repository.ExpenseRepository;
import com.finance.expenseanalyzer.repository.IncomeRepository;
import com.finance.expenseanalyzer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiIntegrationService {

    private final RestTemplate restTemplate;
    private final ExpenseRepository expenseRepository;
    private final IncomeRepository incomeRepository;
    private final UserRepository userRepository;

    @Value("${app.aiServiceUrl}")
    private String aiServiceUrl;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user found in context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private List<Map<String, Object>> expensesToPayload(List<Expense> expenses) {
        return expenses.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("category", e.getCategory() != null ? e.getCategory() : "Other");
            map.put("amount", e.getAmount() != null ? e.getAmount() : 0.0);
            map.put("date", e.getDate() != null ? e.getDate().toString() : LocalDate.now().toString());
            return map;
        }).collect(Collectors.toList());
    }

    private double getMonthlyIncome(User user) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        List<Income> allIncomes = incomeRepository.findByUserIdOrderByDateDesc(user.getId());
        return allIncomes.stream()
                .filter(i -> i.getDate() != null && !i.getDate().isBefore(startOfMonth))
                .mapToDouble(i -> i.getAmount() != null ? i.getAmount() : 0.0)
                .sum();
    }

    // -- Existing methods --

    public AiInsightsResponse getInsights() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        if (expenses.isEmpty()) {
            return AiInsightsResponse.builder()
                    .behaviorAnalysis(Collections.singletonList("No expense data available for analysis."))
                    .savingsSuggestions(Collections.singletonList("Start logging expenses to get AI-powered insights."))
                    .unusualSpendingAlerts(Collections.singletonList("No data to analyze."))
                    .potentialSavings(0.0)
                    .build();
        }

        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("expenses", expensesToPayload(expenses));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<AiInsightsResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/insights", request, AiInsightsResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI Service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("AI Insights engine is currently unreachable: " + ex.getMessage());
        }
    }

    public AiPredictionResponse getPredictions() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        if (expenses.isEmpty()) {
            return AiPredictionResponse.builder()
                    .predictedNextMonthExpense(0.0)
                    .forecastedSavings(0.0)
                    .trendSummary("Insufficient data for prediction.")
                    .build();
        }

        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("expenses", expensesToPayload(expenses));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<AiPredictionResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/predict", request, AiPredictionResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI Service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("AI Prediction engine is currently unreachable: " + ex.getMessage());
        }
    }

    public OcrScanResponse scanReceipt(String base64Image, String fileName) {
        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("image", base64Image);
            payload.put("fileName", fileName);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<OcrScanResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/ocr", request, OcrScanResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("OCR service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("OCR engine is currently unreachable: " + ex.getMessage());
        }
    }

    public AnomalyResponse getAnomalies() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        if (expenses.isEmpty()) {
            return AnomalyResponse.builder()
                    .anomalies(Collections.emptyList())
                    .riskScore(0.0)
                    .summary("No transactions to analyze.")
                    .build();
        }

        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("expenses", expensesToPayload(expenses));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<AnomalyResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/anomalies", request, AnomalyResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Anomaly Detection engine is currently unreachable: " + ex.getMessage());
        }
    }

    public SegmentResponse getSegment() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        if (expenses.isEmpty()) {
            return SegmentResponse.builder()
                    .segments(Collections.emptyList())
                    .pattern("Unknown")
                    .summary("No transaction data.")
                    .build();
        }

        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("expenses", expensesToPayload(expenses));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<SegmentResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/segment", request, SegmentResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Segmentation engine is currently unreachable: " + ex.getMessage());
        }
    }

    public RiskScoreResponse getRiskScore() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());
        double monthlyIncome = getMonthlyIncome(user);

        if (expenses.isEmpty()) {
            return RiskScoreResponse.builder()
                    .overallRisk(0.0)
                    .transactionRisks(Collections.emptyList())
                    .recommendations(Collections.singletonList("No data to analyze."))
                    .build();
        }

        try {
            if (aiServiceUrl == null || aiServiceUrl.trim().isEmpty()) {
                throw new RuntimeException("AI Service URL is not configured.");
            }
            Map<String, Object> payload = new HashMap<>();
            payload.put("expenses", expensesToPayload(expenses));
            payload.put("income", monthlyIncome);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

            ResponseEntity<RiskScoreResponse> response = restTemplate.postForEntity(
                    aiServiceUrl + "/api/ai/risk-score", request, RiskScoreResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI service returned status code: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Risk Scoring engine is currently unreachable: " + ex.getMessage());
        }
    }
}
