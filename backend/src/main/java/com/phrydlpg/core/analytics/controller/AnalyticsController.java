package com.phrydlpg.core.analytics.controller;

import com.phrydlpg.core.analytics.service.AnalyticsService;
import com.phrydlpg.core.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/advanced")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'REGION_MANAGER', 'MANAGER')")
    public ApiResponse<Map<String, Object>> getAdvancedAnalytics() {
        return ApiResponse.success("Analytics retrieved successfully", analyticsService.getAdvancedAnalytics());
    }
}
