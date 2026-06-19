package com.phrydlpg.core.rooms.repository;

import com.phrydlpg.core.rooms.entity.BedAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BedAllocationRepository extends JpaRepository<BedAllocation, UUID> {
    List<BedAllocation> findByTenantId(UUID tenantId);
    
    @Query("SELECT ba FROM BedAllocation ba WHERE ba.bed.id = :bedId AND ba.status = 'ACTIVE'")
    Optional<BedAllocation> findActiveAllocationForBed(UUID bedId);
    
    @Query("SELECT ba FROM BedAllocation ba WHERE ba.tenant.id = :tenantId AND ba.status = 'ACTIVE'")
    Optional<BedAllocation> findActiveAllocationForTenant(UUID tenantId);
}
