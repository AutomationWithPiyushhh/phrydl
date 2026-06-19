package com.phrydlpg.core.analytics.controller;

import com.phrydlpg.core.analytics.dto.DashboardDto;
import com.phrydlpg.core.analytics.service.DashboardService;
import com.phrydlpg.core.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER', 'STAFF')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardDto> getDashboardData() {
        return ApiResponse.success("Dashboard data retrieved successfully", dashboardService.getDashboardKpis());
    }
}
