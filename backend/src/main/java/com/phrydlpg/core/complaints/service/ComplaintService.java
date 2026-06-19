package com.phrydlpg.core.complaints.service;

import com.phrydlpg.core.complaints.dto.ComplaintDto;
import com.phrydlpg.core.complaints.entity.Complaint;
import com.phrydlpg.core.complaints.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final com.phrydlpg.core.tenants.repository.TenantRepository tenantRepository;

    public List<ComplaintDto> getAllComplaints() {
        return complaintRepository.findAll().stream().map(this::mapToDto).collect(java.util.stream.Collectors.toList());
    }

    public ComplaintDto updateComplaintStatus(UUID id, String status) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
        
        complaint.setStatus(status);
        return mapToDto(complaintRepository.save(complaint));
    }

    public ComplaintDto createComplaint(ComplaintDto dto) {
        com.phrydlpg.core.tenants.entity.Tenant tenant = tenantRepository.findById(dto.getTenantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        Complaint complaint = Complaint.builder()
                .tenant(tenant)
                .property(tenant.getBed().getRoom().getProperty())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .status("OPEN")
                .ticketRef("TKT-" + System.currentTimeMillis())
                .build();
        
        Complaint saved = complaintRepository.save(complaint);
        messagingTemplate.convertAndSend("/topic/kpi-updates", "New Complaint Created: " + saved.getTitle());
        return mapToDto(saved);
    }

    private ComplaintDto mapToDto(Complaint complaint) {
        return ComplaintDto.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .createdAt(complaint.getCreatedAt())
                .tenantName(complaint.getTenant() != null ? complaint.getTenant().getUser().getFirstName() + " " + complaint.getTenant().getUser().getLastName() : "N/A")
                .propertyName(complaint.getProperty() != null ? complaint.getProperty().getName() : "N/A")
                .roomNumber(complaint.getTenant() != null && complaint.getTenant().getBed() != null ? complaint.getTenant().getBed().getRoom().getRoomNumber() : "N/A")
                .build();
    }
}
