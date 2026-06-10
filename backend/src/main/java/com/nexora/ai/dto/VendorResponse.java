package com.nexora.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {
    private Long id;
    private Long workspaceId;
    private String name;
    private String email;
    private String phone;
    private BigDecimal amountOwed;
}
