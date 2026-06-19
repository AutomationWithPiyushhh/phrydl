package com.phrydlpg.core.rooms.repository;
import com.phrydlpg.core.rooms.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface BedRepository extends JpaRepository<Bed, UUID> {
    long countByStatus(String status);
    List<Bed> findByRoom_Property_Id(UUID propertyId);
}
