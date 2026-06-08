package com.finance.expenseanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthGithubRequest {
    @NotBlank
    private String code;
}
