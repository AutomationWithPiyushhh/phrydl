package com.phrydlpg.core.tenants.entity;

import com.phrydlpg.core.rooms.entity.Bed;
import com.phrydlpg.core.users.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants", indexes = {
    @Index(name = "idx_tenant_user_id", columnList = "user_id"),
    @Index(name = "idx_tenant_bed_id", columnList = "bed_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id")
    private Bed bed;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private com.phrydlpg.core.leads.entity.Lead lead;

    @Column(name = "tenant_code", nullable = false, unique = true)
    private String tenantCode;

    @Builder.Default
    @Column(name = "kyc_status")
    private String kycStatus = "PENDING";

    @Column(name = "lease_start")
    private LocalDate leaseStart;

    @Column(name = "lease_end")
    private LocalDate leaseEnd;

    @Column(name = "monthly_rent", nullable = false)
    private BigDecimal monthlyRent;

    @Column(name = "security_deposit", nullable = false)
    private BigDecimal securityDeposit;

    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "permanent_address")
    private String permanentAddress;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "employer_or_college")
    private String employerOrCollege;

    @Column(name = "age")
    private Integer age;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
