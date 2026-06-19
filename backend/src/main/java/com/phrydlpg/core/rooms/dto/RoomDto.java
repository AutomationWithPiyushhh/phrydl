package com.phrydlpg.core.rooms.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RoomDto {
    private UUID id;
    private String roomNumber;
    private String type;
    private String status;
    private List<BedDto> beds;
    private String propertyName;
    private UUID propertyId;

    @Data
    @Builder
    public static class BedDto {
        private UUID id;
        private String bedNumber;
        private String status;
        private String tenantName;
    }
}
