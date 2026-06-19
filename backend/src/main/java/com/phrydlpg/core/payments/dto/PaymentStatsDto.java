package com.phrydlpg.core.payments.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentStatsDto {
    private BigDecimal mtdCollection;
    private BigDecimal outstandingDues;
    private BigDecimal totalDepositsHeld;
}
