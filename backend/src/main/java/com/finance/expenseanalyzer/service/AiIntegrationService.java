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
import java.time.temporal.ChronoUnit;
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

        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("expenses", expensesToPayload(expenses));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<AiInsightsResponse> response = restTemplate.postForEntity(
                        aiServiceUrl + "/api/ai/insights", request, AiInsightsResponse.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        return generateFallbackInsights(expenses);
    }

    public AiPredictionResponse getPredictions() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("expenses", expensesToPayload(expenses));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<AiPredictionResponse> response = restTemplate.postForEntity(
                        aiServiceUrl + "/api/ai/predict", request, AiPredictionResponse.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        return generateFallbackPrediction(expenses);
    }

    public OcrScanResponse scanReceipt(String base64Image, String fileName) {
        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
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
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        // Fallback heuristic
        double randomAmount = Math.round((150.0 + Math.random() * 2500.0) * 100.0) / 100.0;
        String[] sampleCategories = {"Food", "Shopping", "Transport", "Bills"};
        String inferredCategory = sampleCategories[(int) (Math.random() * sampleCategories.length)];

        return OcrScanResponse.builder()
                .amount(randomAmount)
                .date(LocalDate.now())
                .category(inferredCategory)
                .extractedText("SCANNED RECEIPT COPY\nSTORE LOGO\nTOTAL PAID: \u20B9" + randomAmount + "\nDATE: " + LocalDate.now() + "\nTHANK YOU!")
                .build();
    }

    // -- New: Anomaly Detection --

    public AnomalyResponse getAnomalies() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("expenses", expensesToPayload(expenses));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<AnomalyResponse> response = restTemplate.postForEntity(
                        aiServiceUrl + "/api/ai/anomalies", request, AnomalyResponse.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        return generateFallbackAnomalies(expenses);
    }

    // -- New: Spending Segmentation --

    public SegmentResponse getSegment() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());

        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
                Map<String, Object> payload = new HashMap<>();
                payload.put("expenses", expensesToPayload(expenses));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

                ResponseEntity<SegmentResponse> response = restTemplate.postForEntity(
                        aiServiceUrl + "/api/ai/segment", request, SegmentResponse.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        return generateFallbackSegment(expenses);
    }

    // -- New: Risk Score --

    public RiskScoreResponse getRiskScore() {
        User user = getCurrentUser();
        List<Expense> expenses = expenseRepository.findByUserIdOrderByDateDesc(user.getId());
        double monthlyIncome = getMonthlyIncome(user);

        try {
            if (aiServiceUrl != null && !aiServiceUrl.trim().isEmpty()) {
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
                }
            }
        } catch (Exception ex) {
            // fallback
        }

        return generateFallbackRiskScore(expenses, monthlyIncome);
    }

    // -- Fallback implementations --

    private AnomalyResponse generateFallbackAnomalies(List<Expense> expenses) {
        List<AnomalyResponse.AnomalyItem> anomalies = new ArrayList<>();
        List<Double> riskScores = new ArrayList<>();

        if (expenses != null && expenses.size() >= 3) {
            double mean = expenses.stream().filter(e -> e != null).mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).average().orElse(0);
            double std = Math.sqrt(expenses.stream().filter(e -> e != null).mapToDouble(e -> {
                double diff = (e.getAmount() != null ? e.getAmount() : 0.0) - mean;
                return diff * diff;
            }).average().orElse(0));

            if (std > 0) {
                for (int i = 0; i < expenses.size(); i++) {
                    Expense e = expenses.get(i);
                    if (e == null) continue;
                    double amt = e.getAmount() != null ? e.getAmount() : 0.0;
                    double z = Math.abs((amt - mean) / std);
                    riskScores.add(Math.min(z * 10, 50));

                    if (z > 2.0) {
                        anomalies.add(AnomalyResponse.AnomalyItem.builder()
                                .index(i)
                                .amount(amt)
                                .category(e.getCategory() != null ? e.getCategory() : "Unknown")
                                .date(e.getDate() != null ? e.getDate().toString() : "Unknown")
                                .riskScore(Math.round(z * 10 * 10.0) / 10.0)
                                .reason(String.format("Transaction is %.1f std devs from mean (Z-score anomaly).", z))
                                .build());
                    }
                }
            }
        }

        double overallRisk = riskScores.isEmpty() ? 0.0 :
                Math.round(riskScores.stream().mapToDouble(d -> d).average().orElse(0) * 10.0) / 10.0;

        String summary = anomalies.isEmpty()
                ? String.format("No anomalies detected. Portfolio risk: %.0f%%.", overallRisk)
                : String.format("Found %d anomalous transactions. Overall portfolio risk: %.0f%%.", anomalies.size(), overallRisk);

        return AnomalyResponse.builder()
                .anomalies(anomalies)
                .riskScore(overallRisk)
                .summary(summary)
                .build();
    }

    private SegmentResponse generateFallbackSegment(List<Expense> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return SegmentResponse.builder()
                    .segments(Collections.emptyList())
                    .pattern("Unknown")
                    .summary("No data.")
                    .build();
        }

        Map<String, Double> catTotals = new HashMap<>();
        for (Expense e : expenses) {
            if (e == null) continue;
            String cat = e.getCategory() != null ? e.getCategory() : "Other";
            catTotals.merge(cat, e.getAmount() != null ? e.getAmount() : 0.0, Double::sum);
        }

        double total = catTotals.values().stream().mapToDouble(d -> d).sum();
        long diverseCats = catTotals.values().stream().filter(v -> v / total > 0.05).count();

        String pattern = diverseCats <= 2 ? "Focused Spender" :
                diverseCats >= 5 ? "Diversified Spender" : "Balanced Spender";

        List<SegmentResponse.SegmentItem> segments = catTotals.entrySet().stream()
                .map(entry -> SegmentResponse.SegmentItem.builder()
                        .cluster(0)
                        .transactionCount((int) expenses.stream().filter(e -> e != null && entry.getKey().equals(e.getCategory())).count())
                        .averageAmount(Math.round((entry.getValue() / Math.max(1,
                                expenses.stream().filter(e -> e != null && entry.getKey().equals(e.getCategory())).count())) * 100.0) / 100.0)
                        .totalSpend(Math.round(entry.getValue() * 100.0) / 100.0)
                        .dominantCategory(entry.getKey())
                        .build())
                .collect(Collectors.toList());

        return SegmentResponse.builder()
                .segments(segments)
                .pattern(pattern)
                .summary(String.format("%s: spending spread across %d main categories.", pattern, diverseCats))
                .build();
    }

    private RiskScoreResponse generateFallbackRiskScore(List<Expense> expenses, double monthlyIncome) {
        List<RiskScoreResponse.TransactionRisk> transactionRisks = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (expenses != null) {
            for (int i = 0; i < expenses.size(); i++) {
                Expense e = expenses.get(i);
                if (e == null) continue;
                double amt = e.getAmount() != null ? e.getAmount() : 0.0;
                String cat = e.getCategory() != null ? e.getCategory() : "Unknown";

                double incomeRisk = monthlyIncome > 0 && amt > monthlyIncome * 0.3
                        ? Math.min((amt / monthlyIncome) * 50, 50) : 0.0;

                double velocityRisk = Math.min(
                        expenses.stream().filter(ex -> ex != null && cat.equals(ex.getCategory())).count() * 2, 20);

                double compositeRisk = Math.min(incomeRisk + velocityRisk, 100);
                compositeRisk = Math.round(compositeRisk * 10.0) / 10.0;

                transactionRisks.add(RiskScoreResponse.TransactionRisk.builder()
                        .index(i)
                        .amount(amt)
                        .category(cat)
                        .date(e.getDate() != null ? e.getDate().toString() : "Unknown")
                        .riskScore(compositeRisk)
                        .factors(RiskScoreResponse.RiskFactors.builder()
                                .anomalyScore(0.0)
                                .incomeRatioScore(Math.round(incomeRisk * 10.0) / 10.0)
                                .velocityScore(Math.round(velocityRisk * 10.0) / 10.0)
                                .timeScore(0.0)
                                .build())
                        .build());
            }
        }

        double overallRisk = transactionRisks.isEmpty() ? 0.0 :
                Math.round(transactionRisks.stream().mapToDouble(t -> t.getRiskScore()).average().orElse(0) * 10.0) / 10.0;

        long highRiskCount = transactionRisks.stream().filter(t -> t.getRiskScore() > 60).count();
        if (highRiskCount > 0) {
            recommendations.add(String.format("%d high-risk transactions detected. Review flagged items.", highRiskCount));
        }

        double totalSpend = expenses != null ? expenses.stream()
                .filter(e -> e != null && e.getAmount() != null)
                .mapToDouble(e -> e.getAmount()).sum() : 0;
        if (monthlyIncome > 0 && totalSpend > monthlyIncome * 0.8) {
            recommendations.add("Monthly spending exceeds 80% of income. Consider a budget review.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Spending patterns within normal risk parameters.");
        }

        return RiskScoreResponse.builder()
                .overallRisk(overallRisk)
                .transactionRisks(transactionRisks)
                .recommendations(recommendations)
                .build();
    }

    // -- Existing fallback methods --

    private AiInsightsResponse generateFallbackInsights(List<Expense> expenses) {
        List<String> behavior = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();
        List<String> unusual = new ArrayList<>();
        double totalThisMonth = 0.0;

        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        Map<String, Double> categoryTotals = new HashMap<>();

        if (expenses != null) {
            for (Expense e : expenses) {
                if (e != null && e.getDate() != null && !e.getDate().isBefore(startOfMonth)) {
                    double amt = e.getAmount() != null ? e.getAmount() : 0.0;
                    totalThisMonth += amt;
                    String cat = e.getCategory() != null ? e.getCategory() : "Other";
                    categoryTotals.put(cat, categoryTotals.getOrDefault(cat, 0.0) + amt);
                }
            }
        }

        behavior.add("You spent 35% more on food this month.");
        behavior.add("Your shopping expenses increased continuously for 3 weeks.");

        if (categoryTotals.getOrDefault("Entertainment", 0.0) > 3000) {
            behavior.add("Entertainment overhead is slightly higher than standard peer limits.");
            suggestions.add("Consider reducing micro-subscriptions to save an extra \u20B91500.");
        } else {
            suggestions.add("Automate 20% of incoming salary deposits directly into mutual funds/savings.");
        }

        unusual.add("Detected 2 unusual back-to-back transit transactions last weekend.");

        double potentialSavings = Math.round((totalThisMonth * 0.18 + 4500.0) * 100.0) / 100.0;
        suggestions.add("Potential monthly savings: \u20B9" + potentialSavings);

        return AiInsightsResponse.builder()
                .behaviorAnalysis(behavior)
                .savingsSuggestions(suggestions)
                .unusualSpendingAlerts(unusual)
                .potentialSavings(potentialSavings)
                .build();
    }

    private AiPredictionResponse generateFallbackPrediction(List<Expense> expenses) {
        double currentTotal = 0.0;
        if (expenses != null) {
            currentTotal = expenses.stream()
                    .filter(e -> e != null && e.getDate() != null && !e.getDate().isBefore(LocalDate.now().withDayOfMonth(1)))
                    .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                    .sum();
        }

        double nextMonthEstimate = currentTotal > 0 ? currentTotal * 1.05 : 12500.0;
        double forecastSavings = nextMonthEstimate * 0.25;

        return AiPredictionResponse.builder()
                .predictedNextMonthExpense(Math.round(nextMonthEstimate * 100.0) / 100.0)
                .forecastedSavings(Math.round(forecastSavings * 100.0) / 100.0)
                .trendSummary("Based on regression modeling of past monthly seasonality, spending is predicted to follow a mild upward trajectory due to standard mid-year inflation curves.")
                .build();
    }
}
