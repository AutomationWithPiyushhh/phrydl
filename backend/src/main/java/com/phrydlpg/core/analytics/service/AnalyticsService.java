package com.phrydlpg.core.analytics.service;

import com.phrydlpg.core.auth.security.UserDetailsImpl;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PropertyRepository propertyRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;
    private final InvoiceRepository invoiceRepository;

    public java.util.Map<String, Object> getAdvancedAnalytics() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        UUID userId = userDetails.getId();

        java.util.stream.Stream<Property> propertyStream = propertyRepository.findAll().stream();

        if ("ROLE_MANAGER".equals(role) || "MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getManager() != null && p.getManager().getId().equals(userId));
        } else if ("ROLE_REGION_MANAGER".equals(role) || "REGION_MANAGER".equals(role)) {
            propertyStream = propertyStream.filter(p -> p.getRegion() != null && p.getRegion().getRegionManager() != null && p.getRegion().getRegionManager().getId().equals(userId));
        }

        List<UUID> allowedPropertyIds = propertyStream.map(Property::getId).collect(Collectors.toList());

        long totalBeds = 0;
        long activeTenants = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalHistoricalTenants = 0;

        if (!allowedPropertyIds.isEmpty()) {
            totalBeds = bedRepository.findAll().stream()
                    .filter(b -> allowedPropertyIds.contains(b.getRoom().getProperty().getId()))
                    .count();

            List<com.phrydlpg.core.tenants.entity.Tenant> tenants = tenantRepository.findAll().stream()
                    .filter(t -> t.getBed() != null && allowedPropertyIds.contains(t.getBed().getRoom().getProperty().getId()))
                    .collect(Collectors.toList());

            activeTenants = tenants.stream().filter(t -> "ACTIVE".equals(t.getStatus())).count();
            totalHistoricalTenants = tenants.size();

            totalRevenue = invoiceRepository.findAll().stream()
                    .filter(i -> i.getProperty() != null && allowedPropertyIds.contains(i.getProperty().getId()))
                    .filter(i -> com.phrydlpg.core.payments.entity.InvoiceStatus.PAID.equals(i.getStatus()))
                    .map(com.phrydlpg.core.payments.entity.Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        double occupancyRate = totalBeds > 0 ? (double) activeTenants / totalBeds * 100 : 0.0;
        BigDecimal revenuePerBed = totalBeds > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalBeds), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // Profitability simplified assumption (Revenue * 0.6)
        BigDecimal profitability = totalRevenue.multiply(BigDecimal.valueOf(0.6));
        
        long churnedTenants = totalHistoricalTenants - activeTenants;
        double churnRate = totalHistoricalTenants > 0 ? (double) churnedTenants / totalHistoricalTenants * 100 : 0.0;

        java.util.Map<String, Object> metrics = new java.util.HashMap<>();
        metrics.put("occupancyRate", occupancyRate);
        metrics.put("revenuePerBed", revenuePerBed);
        metrics.put("profitability", profitability);
        metrics.put("churnRate", churnRate);
        metrics.put("allowedPropertiesCount", allowedPropertyIds.size());

        return metrics;
    }
}
