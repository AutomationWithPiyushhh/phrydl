package com.phrydlpg.core.system.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.system.entity.FeatureToggle;
import com.phrydlpg.core.system.service.FeatureToggleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/features")
@RequiredArgsConstructor
public class FeatureController {

    private final FeatureToggleService featureToggleService;

    @GetMapping
    public ApiResponse<List<FeatureToggle>> getAllFeatures() {
        return ApiResponse.success("Features retrieved successfully", featureToggleService.getAllFeatures());
    }

    @GetMapping("/{featureKey}")
    public ApiResponse<Boolean> isFeatureEnabled(@PathVariable String featureKey) {
        return ApiResponse.success("Feature status retrieved", featureToggleService.isFeatureEnabled(featureKey));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<FeatureToggle> updateFeature(@RequestBody FeatureToggle featureToggle) {
        return ApiResponse.success("Feature updated successfully", featureToggleService.updateFeature(featureToggle));
    }
}
