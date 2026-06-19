package com.phrydlpg.core.payments.entity;

public enum InvoiceStatus {
    DRAFT,
    GENERATED,
    PENDING,
    PARTIALLY_PAID,
    PAID,
    OVERDUE,
    CANCELLED
}
