package com.phrydlpg.core.payments.repository;

import com.phrydlpg.core.payments.entity.TenantLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantLedgerRepository extends JpaRepository<TenantLedger, UUID> {
    List<TenantLedger> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    @Query("SELECT l FROM TenantLedger l WHERE l.tenant.id = :tenantId ORDER BY l.createdAt DESC LIMIT 1")
    Optional<TenantLedger> findLatestByTenantId(UUID tenantId);
}
