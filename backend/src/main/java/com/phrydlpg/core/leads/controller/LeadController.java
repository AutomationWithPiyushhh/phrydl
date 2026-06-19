package com.phrydlpg.core.leads.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.leads.dto.LeadDto;
import com.phrydlpg.core.leads.service.LeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    // Public endpoint for landing page
    @PostMapping
    public ApiResponse<LeadDto> createLead(@RequestBody LeadDto leadDto) {
        return ApiResponse.success("Lead created successfully", leadService.createLead(leadDto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<List<LeadDto>> getAllLeads() {
        return ApiResponse.success("Leads retrieved successfully", leadService.getAllLeads());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<LeadDto> updateLead(@PathVariable String id, @RequestBody LeadDto leadDto) {
        return ApiResponse.success("Lead updated successfully", leadService.updateLead(id, leadDto));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<LeadDto> updateLeadStatus(@PathVariable String id, @RequestParam String status) {
        return ApiResponse.success("Lead status updated successfully", leadService.updateStatus(id, status));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<LeadDto> convertLeadToTenant(@PathVariable String id) {
        return ApiResponse.success("Lead converted to Tenant successfully", leadService.convertToTenant(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<String> deleteLead(@PathVariable String id) {
        leadService.deleteLead(id);
        return ApiResponse.success("Lead deleted successfully", null);
    }
}
