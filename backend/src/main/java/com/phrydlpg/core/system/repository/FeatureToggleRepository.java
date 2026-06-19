package com.phrydlpg.core.system.repository;

import com.phrydlpg.core.system.entity.FeatureToggle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeatureToggleRepository extends JpaRepository<FeatureToggle, UUID> {
    Optional<FeatureToggle> findByFeatureKey(String featureKey);
}
