package com.phrydlpg.core.leads.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadDto {
    private String id;
    private String fullName;
    private String mobileNumber;
    private String email;
    private String gender;
    private String occupation;
    private String preferredLocation;
    private String roomType;
    private LocalDate moveInDate;
    private String additionalRequirements;
    private String source;
    private String assignedTo;
    private String remarks;
    private String status;
    private LocalDateTime createdAt;
}
