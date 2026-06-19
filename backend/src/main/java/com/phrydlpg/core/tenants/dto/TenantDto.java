package com.phrydlpg.core.tenants.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class TenantDto {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String propertyName;
    private String roomNumber;
    private String bedNumber;
    private LocalDate checkInDate;
    private String status;
}
