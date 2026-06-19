package com.phrydlpg.core.common.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String entityType; // e.g. PAYMENT, EXPENSE

    @Column(nullable = false)
    private String entityId;

    @Column(nullable = false)
    private String action; // e.g. CREATED, UPDATED, DELETED

    @Column(length = 1000)
    private String details;

    @Column
    private String performedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}
