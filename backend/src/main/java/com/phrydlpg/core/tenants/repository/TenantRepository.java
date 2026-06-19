package com.phrydlpg.core.tenants.repository;
import com.phrydlpg.core.tenants.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

import java.util.List;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByUser_Id(UUID userId);
    Optional<Tenant> findTopByOrderByTenantCodeDesc();
    List<Tenant> findByBed_Room_Property_Id(UUID propertyId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.securityDeposit) FROM Tenant t WHERE t.status = :status")
    java.math.BigDecimal sumSecurityDepositByStatus(@org.springframework.data.repository.query.Param("status") String status);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(t) FROM Tenant t WHERE t.leaseStart <= :date AND (t.leaseEnd IS NULL OR t.leaseEnd > :date)")
    long countActiveTenantsAtDate(@org.springframework.data.repository.query.Param("date") java.time.LocalDate date);
}
