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
public class ProductResponse {
    private Long id;
    private Long workspaceId;
    private String name;
    private String sku;
    private String category;
    private Integer quantity;
    private Integer threshold;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal totalValue;
    private boolean lowStock;
}
