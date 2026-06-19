package com.phrydlpg.core.notifications.repository;

import com.phrydlpg.core.notifications.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, UUID> {
    List<Notice> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
}
