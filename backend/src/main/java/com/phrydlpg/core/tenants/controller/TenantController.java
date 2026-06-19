package com.phrydlpg.core.tenants.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.tenants.dto.TenantDto;
import com.phrydlpg.core.tenants.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<TenantDto>> getAllTenants() {
        return ApiResponse.success("Tenants retrieved successfully", tenantService.getAllTenants());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<TenantDto> createTenant(@RequestBody com.phrydlpg.core.tenants.dto.CreateTenantRequest request) {
        return ApiResponse.success("Tenant created successfully", tenantService.createTenant(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<TenantDto> updateTenant(@PathVariable java.util.UUID id, @RequestBody com.phrydlpg.core.tenants.dto.UpdateTenantRequest request) {
        return ApiResponse.success("Tenant updated successfully", tenantService.updateTenant(id, request));
    }
}
