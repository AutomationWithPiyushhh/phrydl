package com.phrydlpg.core.payments.entity;

import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.tenants.entity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices", indexes = {
    @Index(name = "idx_invoice_tenant_id", columnList = "tenant_id"),
    @Index(name = "idx_invoice_created_at", columnList = "created_at"),
    @Index(name = "idx_invoice_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "billing_month", nullable = false)
    private String billingMonth; // e.g. "2026-06"

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "late_fee_applied")
    @Builder.Default
    private BigDecimal lateFeeApplied = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private InvoiceStatus status = InvoiceStatus.PENDING;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<InvoiceLineItem> lineItems;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void calculateTotalAmount() {
        BigDecimal sum = this.amount != null ? this.amount : BigDecimal.ZERO;
        sum = sum.add(this.lateFeeApplied != null ? this.lateFeeApplied : BigDecimal.ZERO);
        
        // OR if using lineItems exclusively:
        if (this.lineItems != null && !this.lineItems.isEmpty()) {
            sum = this.lineItems.stream()
                .map(item -> item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        this.totalAmount = sum;
    }
}
