package com.phrydlpg.core.rooms.service;

import com.phrydlpg.core.rooms.entity.Bed;
import com.phrydlpg.core.rooms.entity.BedAllocation;
import com.phrydlpg.core.rooms.repository.BedAllocationRepository;
import com.phrydlpg.core.rooms.repository.BedRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final BedAllocationRepository allocationRepository;
    private final BedRepository bedRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public BedAllocation allocateBed(UUID tenantId, UUID bedId, BigDecimal rentAmount, BigDecimal depositAmount) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Bed not found"));

        // Check if tenant already has an active allocation
        Optional<BedAllocation> existingTenantAllocation = allocationRepository.findActiveAllocationForTenant(tenantId);
        if (existingTenantAllocation.isPresent()) {
            throw new RuntimeException("Tenant already has an active allocation.");
        }

        // Check if bed is already occupied
        Optional<BedAllocation> existingBedAllocation = allocationRepository.findActiveAllocationForBed(bedId);
        if (existingBedAllocation.isPresent() || !"AVAILABLE".equals(bed.getStatus())) {
            throw new RuntimeException("Bed is already occupied.");
        }

        BedAllocation allocation = BedAllocation.builder()
                .tenant(tenant)
                .bed(bed)
                .startDate(LocalDate.now())
                .rentAmount(rentAmount)
                .depositAmount(depositAmount)
                .status("ACTIVE")
                .build();

        bed.setStatus("OCCUPIED");
        bedRepository.save(bed);

        tenant.setMonthlyRent(rentAmount);
        tenant.setSecurityDeposit(depositAmount);
        tenant.setBed(bed);
        tenantRepository.save(tenant);

        return allocationRepository.save(allocation);
    }

    @Transactional
    public BedAllocation transferBed(UUID currentAllocationId, UUID newBedId, BigDecimal newRentAmount) {
        BedAllocation currentAllocation = allocationRepository.findById(currentAllocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));

        if (!"ACTIVE".equals(currentAllocation.getStatus())) {
            throw new RuntimeException("Only ACTIVE allocations can be transferred.");
        }

        Bed newBed = bedRepository.findById(newBedId)
                .orElseThrow(() -> new RuntimeException("New Bed not found"));

        if (!"AVAILABLE".equals(newBed.getStatus())) {
            throw new RuntimeException("New Bed is not available.");
        }

        // Mark old as TRANSFERRED
        currentAllocation.setStatus("TRANSFERRED");
        currentAllocation.setEndDate(LocalDate.now());
        allocationRepository.save(currentAllocation);

        // Mark old bed as AVAILABLE
        Bed oldBed = currentAllocation.getBed();
        oldBed.setStatus("AVAILABLE");
        bedRepository.save(oldBed);

        // Create new allocation
        BedAllocation newAllocation = BedAllocation.builder()
                .tenant(currentAllocation.getTenant())
                .bed(newBed)
                .startDate(LocalDate.now())
                .rentAmount(newRentAmount)
                .depositAmount(currentAllocation.getDepositAmount()) // Carry over deposit
                .status("ACTIVE")
                .build();

        newBed.setStatus("OCCUPIED");
        bedRepository.save(newBed);

        Tenant tenant = currentAllocation.getTenant();
        tenant.setMonthlyRent(newRentAmount);
        tenant.setBed(newBed);
        tenantRepository.save(tenant);

        return allocationRepository.save(newAllocation);
    }

    @Transactional
    public void moveOut(UUID allocationId) {
        BedAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found"));

        if (!"ACTIVE".equals(allocation.getStatus())) {
            throw new RuntimeException("Allocation is not ACTIVE.");
        }

        allocation.setStatus("COMPLETED");
        allocation.setEndDate(LocalDate.now());
        allocationRepository.save(allocation);

        Bed bed = allocation.getBed();
        bed.setStatus("AVAILABLE");
        bedRepository.save(bed);

        Tenant tenant = allocation.getTenant();
        tenant.setBed(null);
        tenant.setLeaseEnd(LocalDate.now());
        tenant.setStatus("MOVED_OUT");
        tenantRepository.save(tenant);
    }
}
