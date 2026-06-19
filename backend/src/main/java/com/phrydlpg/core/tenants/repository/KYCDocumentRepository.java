package com.phrydlpg.core.tenants.repository;

import com.phrydlpg.core.tenants.entity.KYCDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface KYCDocumentRepository extends JpaRepository<KYCDocument, UUID> {
    List<KYCDocument> findByTenantId(UUID tenantId);
}
