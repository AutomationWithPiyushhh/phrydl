package com.phrydlpg.core.properties.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PropertyDto {
    private UUID id;
    private String name;
    private String address;
    private Integer capacity;
    private String type;
    private String status;
    private Integer occupancy;
    private Double occupancyRate;
}
