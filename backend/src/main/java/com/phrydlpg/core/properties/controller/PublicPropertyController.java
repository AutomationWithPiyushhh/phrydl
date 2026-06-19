package com.phrydlpg.core.properties.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/properties")
@RequiredArgsConstructor
public class PublicPropertyController {

    private final PropertyRepository propertyRepository;

    @GetMapping
    public ApiResponse<List<Property>> getAllPublicProperties() {
        return ApiResponse.success("Properties retrieved", propertyRepository.findByStatus("ACTIVE"));
    }

    @GetMapping("/{slug}")
    public ApiResponse<Property> getPropertyBySlug(@PathVariable String slug) {
        return propertyRepository.findBySlug(slug)
                .map(p -> ApiResponse.success("Property retrieved", p))
                .orElse(ApiResponse.error("Property not found"));
    }
}
