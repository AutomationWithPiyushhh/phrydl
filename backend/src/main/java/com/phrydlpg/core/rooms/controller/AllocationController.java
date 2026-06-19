package com.phrydlpg.core.rooms.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.rooms.entity.BedAllocation;
import com.phrydlpg.core.rooms.service.AllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<BedAllocation> allocateBed(
            @RequestParam UUID tenantId,
            @RequestParam UUID bedId,
            @RequestParam BigDecimal rentAmount,
            @RequestParam BigDecimal depositAmount) {
        BedAllocation allocation = allocationService.allocateBed(tenantId, bedId, rentAmount, depositAmount);
        return ApiResponse.success("Bed allocated successfully", allocation);
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<BedAllocation> transferBed(
            @PathVariable UUID id,
            @RequestParam UUID newBedId,
            @RequestParam BigDecimal newRentAmount) {
        BedAllocation allocation = allocationService.transferBed(id, newBedId, newRentAmount);
        return ApiResponse.success("Tenant transferred successfully", allocation);
    }

    @PostMapping("/{id}/move-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<String> moveOut(@PathVariable UUID id) {
        allocationService.moveOut(id);
        return ApiResponse.success("Tenant moved out successfully", null);
    }
}
