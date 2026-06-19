package com.phrydlpg.core.properties.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PropertyMatrixDto {
    private UUID propertyId;
    private String propertyName;
    private List<FloorMatrixDto> floors;

    @Data
    @Builder
    public static class FloorMatrixDto {
        private String floorNumber;
        private List<RoomMatrixDto> rooms;
    }

    @Data
    @Builder
    public static class RoomMatrixDto {
        private UUID roomId;
        private String roomNumber;
        private String type;
        private List<BedMatrixDto> beds;
    }

    @Data
    @Builder
    public static class BedMatrixDto {
        private UUID bedId;
        private String bedNumber;
        private String status;
        private UUID tenantId;
        private String tenantName;
        private String occupation;
        private LocalDate moveInDate;
        private BigDecimal rentAmount;
        private String kycStatus;
    }
}
