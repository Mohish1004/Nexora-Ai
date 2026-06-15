package com.nexora.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhoneLoginRequest {
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @NotBlank(message = "ID token is required")
    private String idToken;
}
