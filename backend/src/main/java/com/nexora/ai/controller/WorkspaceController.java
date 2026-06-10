package com.nexora.ai.controller;

import com.nexora.ai.dto.ApiResponse;
import com.nexora.ai.dto.WorkspaceRequest;
import com.nexora.ai.dto.WorkspaceResponse;
import com.nexora.ai.entity.Workspace;
import com.nexora.ai.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkspaceResponse>>> getWorkspaces(Principal principal) {
        List<Workspace> workspaces = workspaceService.getUserWorkspaces(principal.getName());
        List<WorkspaceResponse> response = workspaces.stream()
                .map(w -> WorkspaceResponse.builder()
                        .id(w.getId())
                        .name(w.getName())
                        .type(w.getType())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Workspaces retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkspaceResponse>> createWorkspace(
            Principal principal,
            @Valid @RequestBody WorkspaceRequest request) {
        Workspace w = workspaceService.createWorkspace(principal.getName(), request.getName(), request.getType());
        WorkspaceResponse response = WorkspaceResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .type(w.getType())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Workspace created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkspaceResponse>> getWorkspace(
            Principal principal,
            @PathVariable Long id) {
        Workspace w = workspaceService.getWorkspaceForUser(principal.getName(), id);
        WorkspaceResponse response = WorkspaceResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .type(w.getType())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Workspace retrieved successfully", response));
    }
}
