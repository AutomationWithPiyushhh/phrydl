package com.phrydlpg.core.payments.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentDto {
    private UUID id;
    private BigDecimal amount;
    private String type; // RENT, DEPOSIT, MAINTENANCE
    private String method; // UPI, CARD, CASH
    private String status;
    private String referenceId;
    private LocalDateTime paymentDate;
    
    // Minimal tenant details
    private UUID tenantId;
    private String tenantName;
    private String propertyName;
    private String receiptUrl;
}
