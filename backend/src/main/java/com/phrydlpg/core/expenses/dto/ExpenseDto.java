package com.phrydlpg.core.expenses.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ExpenseDto {
    private UUID id;
    private UUID propertyId;
    private String propertyName;
    private String title;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate expenseDate;
    private String status;
    private String billUrl;
}
