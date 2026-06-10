package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.BusinessDashboardResponse;
import com.nexora.ai.dto.PersonalDashboardResponse;
import com.nexora.ai.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/business")
    public ResponseEntity<ApiResponse<BusinessDashboardResponse>> getBusinessDashboard(
            Principal principal,
            @PathVariable Long workspaceId) {
        BusinessDashboardResponse response = dashboardService.getBusinessDashboard(principal.getName(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Business dashboard loaded", response));
    }

    @GetMapping("/personal")
    public ResponseEntity<ApiResponse<PersonalDashboardResponse>> getPersonalDashboard(
            Principal principal,
            @PathVariable Long workspaceId) {
        PersonalDashboardResponse response = dashboardService.getPersonalDashboard(principal.getName(), workspaceId);
        return ResponseEntity.ok(ApiResponse.success("Personal dashboard loaded", response));
    }
}
