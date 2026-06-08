package com.finance.expenseanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthGoogleRequest {
    @NotBlank
    private String idToken;
}
