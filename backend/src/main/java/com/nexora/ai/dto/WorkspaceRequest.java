package com.nexora.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkspaceRequest {
    @NotBlank(message = "Workspace name is required")
    private String name;

    @NotBlank(message = "Workspace type is required")
    private String type; // BUSINESS, PERSONAL
}
