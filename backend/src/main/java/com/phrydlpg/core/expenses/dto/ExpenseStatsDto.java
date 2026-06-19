package com.phrydlpg.core.expenses.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ExpenseStatsDto {
    private BigDecimal totalExpenses;
    private BigDecimal paidExpenses;
    private BigDecimal pendingExpenses;
}
