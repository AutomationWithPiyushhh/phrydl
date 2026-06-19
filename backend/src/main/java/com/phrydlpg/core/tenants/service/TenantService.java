package com.phrydlpg.core.tenants.service;

import com.phrydlpg.core.rooms.entity.Bed;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.tenants.dto.CreateTenantRequest;
import com.phrydlpg.core.tenants.dto.TenantDto;
import com.phrydlpg.core.tenants.dto.UpdateTenantRequest;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.users.entity.Role;
import com.phrydlpg.core.users.entity.User;
import com.phrydlpg.core.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BedRepository bedRepository;
    private final PasswordEncoder passwordEncoder;

    public List<TenantDto> getAllTenants() {
        return tenantRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TenantDto createTenant(CreateTenantRequest request) {
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode("password123")) // Default password
                .role(Role.TENANT)
                .status("ACTIVE")
                .build();
        user = userRepository.save(user);

        Bed bed = null;
        if (request.getBedId() != null) {
            bed = bedRepository.findById(request.getBedId()).orElseThrow(() -> new RuntimeException("Bed not found"));
            bed.setStatus("OCCUPIED");
            bedRepository.save(bed);
        }

        String tenantCode = generateTenantCode();

        Tenant tenant = Tenant.builder()
                .user(user)
                .bed(bed)
                .tenantCode(tenantCode)
                .monthlyRent(request.getMonthlyRent())
                .securityDeposit(request.getSecurityDeposit())
                .leaseStart(request.getLeaseStart())
                .leaseEnd(request.getLeaseEnd())
                .emergencyContact(request.getEmergencyContact())
                .permanentAddress(request.getPermanentAddress())
                .occupation(request.getOccupation())
                .employerOrCollege(request.getEmployerOrCollege())
                .age(request.getAge())
                .status("ACTIVE")
                .kycStatus("PENDING")
                .build();
        
        tenant = tenantRepository.save(tenant);
        return mapToDto(tenant);
    }

    @Transactional
    public TenantDto updateTenant(UUID id, UpdateTenantRequest request) {
        Tenant tenant = tenantRepository.findById(id).orElseThrow(() -> new RuntimeException("Tenant not found"));
        User user = tenant.getUser();
        
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);

        if (request.getBedId() != null && (tenant.getBed() == null || !tenant.getBed().getId().equals(request.getBedId()))) {
            if (tenant.getBed() != null) {
                Bed oldBed = tenant.getBed();
                oldBed.setStatus("AVAILABLE");
                bedRepository.save(oldBed);
            }
            Bed newBed = bedRepository.findById(request.getBedId()).orElseThrow(() -> new RuntimeException("Bed not found"));
            newBed.setStatus("OCCUPIED");
            bedRepository.save(newBed);
            tenant.setBed(newBed);
        }

        if (request.getMonthlyRent() != null) tenant.setMonthlyRent(request.getMonthlyRent());
        if (request.getSecurityDeposit() != null) tenant.setSecurityDeposit(request.getSecurityDeposit());
        if (request.getLeaseStart() != null) tenant.setLeaseStart(request.getLeaseStart());
        if (request.getLeaseEnd() != null) tenant.setLeaseEnd(request.getLeaseEnd());
        if (request.getEmergencyContact() != null) tenant.setEmergencyContact(request.getEmergencyContact());
        if (request.getPermanentAddress() != null) tenant.setPermanentAddress(request.getPermanentAddress());
        if (request.getOccupation() != null) tenant.setOccupation(request.getOccupation());
        if (request.getEmployerOrCollege() != null) tenant.setEmployerOrCollege(request.getEmployerOrCollege());
        if (request.getAge() != null) tenant.setAge(request.getAge());
        if (request.getStatus() != null) tenant.setStatus(request.getStatus());

        tenant = tenantRepository.save(tenant);
        return mapToDto(tenant);
    }

    private String generateTenantCode() {
        Optional<Tenant> topTenant = tenantRepository.findTopByOrderByTenantCodeDesc();
        if (topTenant.isPresent()) {
            String code = topTenant.get().getTenantCode();
            if (code != null && code.startsWith("TEN-")) {
                try {
                    int num = Integer.parseInt(code.substring(4));
                    return "TEN-" + (num + 1);
                } catch (NumberFormatException e) {
                    // Ignore and fallback
                }
            }
        }
        return "TEN-1001";
    }

    private TenantDto mapToDto(Tenant tenant) {
        String propertyName = null;
        String roomNumber = null;
        String bedNumber = null;

        if (tenant.getBed() != null) {
            bedNumber = tenant.getBed().getBedNumber();
            if (tenant.getBed().getRoom() != null) {
                roomNumber = tenant.getBed().getRoom().getRoomNumber();
                if (tenant.getBed().getRoom().getProperty() != null) {
                    propertyName = tenant.getBed().getRoom().getProperty().getName();
                }
            }
        }

        return TenantDto.builder()
                .id(tenant.getId())
                .name(tenant.getUser().getFirstName() + " " + tenant.getUser().getLastName())
                .email(tenant.getUser().getEmail())
                .phone(tenant.getUser().getPhoneNumber() != null ? tenant.getUser().getPhoneNumber() : "")
                .propertyName(propertyName)
                .roomNumber(roomNumber)
                .bedNumber(bedNumber)
                .checkInDate(tenant.getLeaseStart())
                .status(tenant.getStatus())
                .build();
    }
}
