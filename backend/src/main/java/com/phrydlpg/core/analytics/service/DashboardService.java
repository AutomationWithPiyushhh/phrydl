package com.phrydlpg.core.analytics.service;

import com.phrydlpg.core.analytics.repository.LandingPageEventRepository;
import com.phrydlpg.core.analytics.dto.DashboardDto;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.payments.repository.PaymentRepository;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.leads.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final BedRepository bedRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final LandingPageEventRepository landingPageEventRepository;
    private final LeadRepository leadRepository;
    private final com.phrydlpg.core.complaints.repository.ComplaintRepository complaintRepository;

    private final AnalyticsService analyticsService;

    public DashboardDto getDashboardKpis() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        com.phrydlpg.core.auth.security.UserDetailsImpl userDetails = (com.phrydlpg.core.auth.security.UserDetailsImpl) auth.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        java.util.UUID userId = userDetails.getId();

        java.util.stream.Stream<com.phrydlpg.core.properties.entity.Property> propertyStream = propertyRepository.findAll().stream();
        if ("ROLE_MANAGER".equals(role) || "MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getManager() != null && p.getManager().getId().equals(userId));
        } else if ("ROLE_REGION_MANAGER".equals(role) || "REGION_MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getRegion() != null && p.getRegion().getRegionManager() != null && p.getRegion().getRegionManager().getId().equals(userId));
        }
        java.util.List<java.util.UUID> allowedPropertyIds = propertyStream.map(com.phrydlpg.core.properties.entity.Property::getId).collect(java.util.stream.Collectors.toList());

        java.util.Map<String, Object> advancedAnalytics = analyticsService.getAdvancedAnalytics();
        
        long totalProperties = allowedPropertyIds.size();
        
        List<com.phrydlpg.core.tenants.entity.Tenant> tenants = tenantRepository.findAll().stream()
                .filter(t -> t.getBed() != null && allowedPropertyIds.contains(t.getBed().getRoom().getProperty().getId()))
                .collect(java.util.stream.Collectors.toList());
        long totalTenants = tenants.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();

        BigDecimal totalRevenue = invoiceRepository.findAll().stream()
                .filter(i -> i.getProperty() != null && allowedPropertyIds.contains(i.getProperty().getId()))
                .filter(i -> com.phrydlpg.core.payments.entity.InvoiceStatus.PAID.equals(i.getStatus()))
                .map(com.phrydlpg.core.payments.entity.Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        BigDecimal outstanding = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getProperty() != null && allowedPropertyIds.contains(inv.getProperty().getId()))
                .filter(inv -> com.phrydlpg.core.payments.entity.InvoiceStatus.PENDING.equals(inv.getStatus()))
                .map(com.phrydlpg.core.payments.entity.Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalLeads = leadRepository.count();
        long convertedLeads = leadRepository.countByStatus("CONVERTED");
        double leadConversionRate = totalLeads > 0 ? (double) convertedLeads / totalLeads * 100 : 0.0;

        List<com.phrydlpg.core.complaints.entity.Complaint> complaints = complaintRepository.findAll().stream()
                .filter(c -> c.getProperty() != null && allowedPropertyIds.contains(c.getProperty().getId()))
                .collect(java.util.stream.Collectors.toList());
        long totalComplaints = complaints.size();
        long resolvedComplaints = complaints.stream().filter(c -> "RESOLVED".equals(c.getStatus())).count();
        double complaintResolutionRate = totalComplaints > 0 ? (double) resolvedComplaints / totalComplaints * 100 : 0.0;

        DashboardDto.KpiCards kpis = DashboardDto.KpiCards.builder()
                .totalProperties((int) totalProperties)
                .totalTenants((int) totalTenants)
                .occupancyRate((Double) advancedAnalytics.get("occupancyRate"))
                .monthlyRevenue(totalRevenue)
                .outstandingDues(outstanding)
                .netProfit((BigDecimal) advancedAnalytics.get("profitability"))
                .leadConversionRate(leadConversionRate)
                .complaintResolutionRate(complaintResolutionRate)
                .revenuePerBed((BigDecimal) advancedAnalytics.get("revenuePerBed"))
                .churnRate((Double) advancedAnalytics.get("churnRate"))
                .build();

        long bookRoomClicks = landingPageEventRepository.countBySource("BOOK_ROOM");
        long scheduleVisitClicks = landingPageEventRepository.countBySource("SCHEDULE_VISIT");
        long whatsappClicks = landingPageEventRepository.countBySource("WHATSAPP");
        long callClicks = landingPageEventRepository.countBySource("CALL");
        long contactFormSubmissions = landingPageEventRepository.countBySource("CONTACT_FORM");

        // Dynamic trends for past 3 months
        java.util.List<DashboardDto.ChartData> revenueTrend = new java.util.ArrayList<>();
        java.util.List<DashboardDto.ChartData> occupancyTrend = new java.util.ArrayList<>();
        java.time.YearMonth currentMonth = java.time.YearMonth.now();

        for (int m = 2; m >= 0; m--) {
            java.time.YearMonth targetMonth = currentMonth.minusMonths(m);
            java.time.LocalDateTime startOfMonth = targetMonth.atDay(1).atStartOfDay();
            java.time.LocalDateTime endOfMonth = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            BigDecimal revCurrent = invoiceRepository.findAll().stream()
                    .filter(inv -> inv.getProperty() != null && allowedPropertyIds.contains(inv.getProperty().getId()))
                    .filter(inv -> com.phrydlpg.core.payments.entity.InvoiceStatus.PAID.equals(inv.getStatus()))
                    .filter(inv -> !inv.getCreatedAt().isBefore(startOfMonth) && !inv.getCreatedAt().isAfter(endOfMonth))
                    .map(com.phrydlpg.core.payments.entity.Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            java.time.YearMonth prevTargetMonth = targetMonth.minusMonths(1);
            java.time.LocalDateTime startOfPrevMonth = prevTargetMonth.atDay(1).atStartOfDay();
            java.time.LocalDateTime endOfPrevMonth = prevTargetMonth.atEndOfMonth().atTime(23, 59, 59);

            BigDecimal revPrev = invoiceRepository.findAll().stream()
                    .filter(inv -> inv.getProperty() != null && allowedPropertyIds.contains(inv.getProperty().getId()))
                    .filter(inv -> com.phrydlpg.core.payments.entity.InvoiceStatus.PAID.equals(inv.getStatus()))
                    .filter(inv -> !inv.getCreatedAt().isBefore(startOfPrevMonth) && !inv.getCreatedAt().isAfter(endOfPrevMonth))
                    .map(com.phrydlpg.core.payments.entity.Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String monthName = java.time.format.DateTimeFormatter.ofPattern("MMM").format(targetMonth);
            revenueTrend.add(DashboardDto.ChartData.builder().name(monthName).current(revCurrent).previous(revPrev).build());

            // Occupancy
            long activeTenantsAtCurrent = tenantRepository.findAll().stream()
                    .filter(t -> t.getBed() != null && allowedPropertyIds.contains(t.getBed().getRoom().getProperty().getId()))
                    .filter(t -> "ACTIVE".equals(t.getStatus()) && !t.getCreatedAt().isAfter(endOfMonth))
                    .count();

            long activeTenantsAtPrev = tenantRepository.findAll().stream()
                    .filter(t -> t.getBed() != null && allowedPropertyIds.contains(t.getBed().getRoom().getProperty().getId()))
                    .filter(t -> "ACTIVE".equals(t.getStatus()) && !t.getCreatedAt().isAfter(endOfPrevMonth))
                    .count();
                    
            long totalBedsForTrend = bedRepository.findAll().stream()
                    .filter(b -> allowedPropertyIds.contains(b.getRoom().getProperty().getId()))
                    .count();

            double occCurrent = totalBedsForTrend > 0 ? (double) activeTenantsAtCurrent / totalBedsForTrend * 100 : 0.0;
            double occPrev = totalBedsForTrend > 0 ? (double) activeTenantsAtPrev / totalBedsForTrend * 100 : 0.0;

            occupancyTrend.add(DashboardDto.ChartData.builder().name(monthName)
                    .current(BigDecimal.valueOf(occCurrent))
                    .previous(BigDecimal.valueOf(occPrev))
                    .build());
        }

        return DashboardDto.builder()
                .kpis(kpis)
                .landingPageAnalytics(DashboardDto.LandingPageAnalytics.builder()
                        .totalLeads((int) totalLeads)
                        .bookRoomClicks((int) bookRoomClicks)
                        .scheduleVisitClicks((int) scheduleVisitClicks)
                        .whatsappClicks((int) whatsappClicks)
                        .callClicks((int) callClicks)
                        .contactFormSubmissions((int) contactFormSubmissions)
                        .build())
                .revenueTrend(revenueTrend)
                .occupancyTrend(occupancyTrend)
                .build();
    }
}
