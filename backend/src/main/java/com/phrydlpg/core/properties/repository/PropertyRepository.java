package com.phrydlpg.core.properties.repository;
import com.phrydlpg.core.properties.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    Optional<Property> findBySlug(String slug);
    List<Property> findByStatus(String status);
}
