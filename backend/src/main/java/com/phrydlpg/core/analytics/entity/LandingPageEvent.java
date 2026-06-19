package com.phrydlpg.core.analytics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "landing_page_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandingPageEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // e.g., CTA_CLICK, PAGE_VISIT
    private String source; // e.g., BOOK_ROOM, WHATSAPP, CALL
    private String title; // Context title
    private LocalDateTime timestamp;
}
