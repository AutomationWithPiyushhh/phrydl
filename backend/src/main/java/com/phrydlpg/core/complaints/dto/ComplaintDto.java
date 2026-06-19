package com.phrydlpg.core.complaints.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ComplaintDto {
    private UUID id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private UUID tenantId;
    private String tenantName;
    private String propertyName;
    private String roomNumber;
}
