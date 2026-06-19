package com.phrydlpg.core.analytics.repository;

import com.phrydlpg.core.analytics.entity.LandingPageEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LandingPageEventRepository extends JpaRepository<LandingPageEvent, Long> {
    long countBySource(String source);
    long countByType(String type);
}
