package com.phrydlpg.core.tenants.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateTenantRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UUID bedId;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
    private LocalDate leaseStart;
    private LocalDate leaseEnd;
    private String emergencyContact;
    private String permanentAddress;
    private String occupation;
    private String employerOrCollege;
    private Integer age;
    private String status;
}
