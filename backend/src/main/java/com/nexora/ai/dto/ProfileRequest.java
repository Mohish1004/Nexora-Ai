package com.nexora.ai.dto;

import lombok.Data;

@Data
public class ProfileRequest {
    private String fullName;
    private String currentPassword;
    private String newPassword;
}
