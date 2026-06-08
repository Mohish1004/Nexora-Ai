package com.finance.expenseanalyzer.controller;

import com.finance.expenseanalyzer.dto.*;
import com.finance.expenseanalyzer.service.AiIntegrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiIntegrationController {

    private final AiIntegrationService aiIntegrationService;

    @GetMapping("/insights")
    public ResponseEntity<AiInsightsResponse> getInsights() {
        return ResponseEntity.ok(aiIntegrationService.getInsights());
    }

    @GetMapping("/predict")
    public ResponseEntity<AiPredictionResponse> getPredictions() {
        return ResponseEntity.ok(aiIntegrationService.getPredictions());
    }

    @PostMapping("/ocr")
    public ResponseEntity<OcrScanResponse> scanReceipt(@RequestBody Map<String, String> payload) {
        String base64Image = payload.get("image");
        String fileName = payload.get("fileName");
        return ResponseEntity.ok(aiIntegrationService.scanReceipt(base64Image, fileName));
    }

    @PostMapping("/explain-trend")
    public ResponseEntity<Map<String, Object>> explainTrend(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(aiIntegrationService.explainTrend(payload));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<AnomalyResponse> getAnomalies() {
        return ResponseEntity.ok(aiIntegrationService.getAnomalies());
    }

    @GetMapping("/segment")
    public ResponseEntity<SegmentResponse> getSegment() {
        return ResponseEntity.ok(aiIntegrationService.getSegment());
    }

    @GetMapping("/risk-score")
    public ResponseEntity<RiskScoreResponse> getRiskScore() {
        return ResponseEntity.ok(aiIntegrationService.getRiskScore());
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAiHealth() {
        return ResponseEntity.ok(aiIntegrationService.getAiHealth());
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<Map<String, Object>> getSubscriptions() {
        return ResponseEntity.ok(aiIntegrationService.getSubscriptions());
    }
}
