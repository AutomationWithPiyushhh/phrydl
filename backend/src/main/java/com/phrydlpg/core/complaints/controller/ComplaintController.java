package com.phrydlpg.core.complaints.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.complaints.dto.ComplaintDto;
import com.phrydlpg.core.complaints.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')")
    public ApiResponse<List<ComplaintDto>> getAllComplaints() {
        return ApiResponse.success("Complaints retrieved successfully", complaintService.getAllComplaints());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF')")
    public ApiResponse<ComplaintDto> updateComplaintStatus(@PathVariable UUID id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ApiResponse.success("Complaint status updated successfully", complaintService.updateComplaintStatus(id, status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT')")
    public ApiResponse<ComplaintDto> createComplaint(@RequestBody ComplaintDto dto) {
        return ApiResponse.success("Complaint created successfully", complaintService.createComplaint(dto));
    }
}
