package com.finance.expenseanalyzer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDto {
    private Long id;
    private String title;
    private String mode;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
