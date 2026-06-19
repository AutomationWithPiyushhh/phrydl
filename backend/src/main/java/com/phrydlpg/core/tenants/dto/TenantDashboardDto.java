package com.phrydlpg.core.tenants.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TenantDashboardDto {
    private String name;
    private String propertyName;
    private String roomNumber;
    private String kycStatus;
    private BigDecimal currentRentDue;
    private LocalDate rentDueDate;
    private List<NoticeDto> activeNotices;
    private List<QuickComplaintDto> activeComplaints;
    @Data
    @Builder
    public static class NoticeDto {
        private String title;
        private String content;
        private String date;
    }

    @Data
    @Builder
    public static class QuickComplaintDto {
        private String id;
        private String title;
        private String status;
    }
}
