package com.phrydlpg.core.complaints.repository;
import com.phrydlpg.core.complaints.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {
    List<Complaint> findByTenant_Id(UUID tenantId);
    long countByStatus(String status);
}
