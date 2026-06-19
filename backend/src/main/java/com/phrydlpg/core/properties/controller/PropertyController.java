package com.phrydlpg.core.properties.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.properties.dto.PropertyDto;
import com.phrydlpg.core.properties.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import java.util.List;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<PropertyDto>> getAllProperties() {
        return ApiResponse.success("Properties retrieved successfully", propertyService.getAllProperties());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<PropertyDto> createProperty(@RequestBody PropertyDto dto) {
        return ApiResponse.success("Property created successfully", propertyService.createProperty(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<PropertyDto> updateProperty(@PathVariable UUID id, @RequestBody PropertyDto dto) {
        return ApiResponse.success("Property updated successfully", propertyService.updateProperty(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<Void> deleteProperty(@PathVariable UUID id) {
        propertyService.deleteProperty(id);
        return ApiResponse.success("Property deleted successfully", null);
    }

    @GetMapping("/{id}/matrix")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<com.phrydlpg.core.properties.dto.PropertyMatrixDto> getPropertyMatrix(@PathVariable UUID id) {
        return ApiResponse.success("Property matrix retrieved successfully", propertyService.getPropertyMatrix(id));
    }
}
