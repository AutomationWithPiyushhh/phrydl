package com.phrydlpg.core.leads.service;

import com.phrydlpg.core.leads.dto.LeadDto;
import com.phrydlpg.core.leads.entity.Lead;
import com.phrydlpg.core.leads.repository.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.phrydlpg.core.notifications.service.NotificationService;
import java.util.UUID;
import com.phrydlpg.core.users.repository.UserRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.phrydlpg.core.users.entity.User;
import com.phrydlpg.core.users.entity.Role;
import com.phrydlpg.core.tenants.entity.Tenant;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    public LeadDto createLead(LeadDto leadDto) {
        Lead lead = Lead.builder()
                .fullName(leadDto.getFullName())
                .mobileNumber(leadDto.getMobileNumber())
                .email(leadDto.getEmail())
                .gender(leadDto.getGender())
                .occupation(leadDto.getOccupation())
                .preferredLocation(leadDto.getPreferredLocation())
                .roomType(leadDto.getRoomType())
                .moveInDate(leadDto.getMoveInDate())
                .additionalRequirements(leadDto.getAdditionalRequirements())
                .source(leadDto.getSource() != null ? leadDto.getSource() : "WEBSITE")
                .status("NEW")
                .build();

        Lead savedLead = leadRepository.save(lead);
        
        notificationService.notifyAdmins("New Lead Received", 
            "A new inquiry from " + savedLead.getFullName() + " for " + savedLead.getPreferredLocation() + ".", 
            "LEAD");

        return mapToDto(savedLead);
    }

    public LeadDto updateStatus(String id, String status) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        lead.setStatus(status);
        return mapToDto(leadRepository.save(lead));
    }

    public LeadDto updateLead(String id, LeadDto leadDto) {
        Lead lead = leadRepository.findById(id).orElseThrow();
        if (leadDto.getAssignedTo() != null) lead.setAssignedTo(leadDto.getAssignedTo());
        if (leadDto.getRemarks() != null) lead.setRemarks(leadDto.getRemarks());
        if (leadDto.getStatus() != null) lead.setStatus(leadDto.getStatus());
        return mapToDto(leadRepository.save(lead));
    }

    public void deleteLead(String id) {
        leadRepository.deleteById(id);
    }

    public LeadDto convertToTenant(String leadId) {
        Lead lead = leadRepository.findById(leadId).orElseThrow(() -> new RuntimeException("Lead not found"));
        
        if ("CONVERTED".equals(lead.getStatus())) {
            throw new RuntimeException("Lead is already converted");
        }

        // 1. Create User
        String tempPassword = "phrydlpg_" + UUID.randomUUID().toString().substring(0, 8);
        User user = User.builder()
                .email(lead.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .firstName(lead.getFullName()) // Simplified
                .role(Role.TENANT)
                .phoneNumber(lead.getMobileNumber())
                .build();
        user = userRepository.save(user);

        // 2. Create Tenant
        Tenant tenant = Tenant.builder()
                .user(user)
                .lead(lead)
                .tenantCode("T-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .leaseStart(lead.getMoveInDate())
                .monthlyRent(BigDecimal.ZERO) // Will be updated during allocation
                .securityDeposit(BigDecimal.ZERO)
                .occupation(lead.getOccupation())
                .build();
        tenantRepository.save(tenant);

        // 3. Update Lead Status
        lead.setStatus("CONVERTED");
        lead = leadRepository.save(lead);

        // 4. Notify Lead
        notificationService.notifyUser(user.getId(), "Welcome to PhrydlPG", "Your account has been created. Your temporary password is: " + tempPassword, "SYSTEM");

        return mapToDto(lead);
    }

    public List<LeadDto> getAllLeads() {
        return leadRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private LeadDto mapToDto(Lead lead) {
        return LeadDto.builder()
                .id(lead.getId())
                .fullName(lead.getFullName())
                .mobileNumber(lead.getMobileNumber())
                .email(lead.getEmail())
                .gender(lead.getGender())
                .occupation(lead.getOccupation())
                .preferredLocation(lead.getPreferredLocation())
                .roomType(lead.getRoomType())
                .moveInDate(lead.getMoveInDate())
                .additionalRequirements(lead.getAdditionalRequirements())
                .source(lead.getSource())
                .assignedTo(lead.getAssignedTo())
                .remarks(lead.getRemarks())
                .status(lead.getStatus())
                .createdAt(lead.getCreatedAt())
                .build();
    }
}
