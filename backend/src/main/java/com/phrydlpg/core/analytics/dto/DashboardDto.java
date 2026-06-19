package com.phrydlpg.core.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardDto {
    private KpiCards kpis;
    private LandingPageAnalytics landingPageAnalytics;
    private List<ChartData> revenueTrend;
    private List<ChartData> occupancyTrend;

    @Data
    @Builder
    public static class KpiCards {
        private int totalProperties;
        private int totalTenants;
        private double occupancyRate;
        private BigDecimal monthlyRevenue;
        private BigDecimal outstandingDues;
        private BigDecimal netProfit;
        private double leadConversionRate;
        private double complaintResolutionRate;
        private BigDecimal revenuePerBed;
        private double churnRate;
    }

    @Data
    @Builder
    public static class ChartData {
        private String name;
        private BigDecimal current;
        private BigDecimal previous;
    }

    @Data
    @Builder
    public static class LandingPageAnalytics {
        private int totalLeads;
        private int bookRoomClicks;
        private int scheduleVisitClicks;
        private int whatsappClicks;
        private int callClicks;
        private int contactFormSubmissions;
    }
}
