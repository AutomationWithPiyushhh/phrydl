package com.phrydlpg.core.rooms.controller;

import com.phrydlpg.core.analytics.entity.LandingPageEvent;
import com.phrydlpg.core.analytics.repository.LandingPageEventRepository;
import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.rooms.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final BedRepository bedRepository;
    private final LandingPageEventRepository landingPageEventRepository;

    @GetMapping("/room-availability")
    public ApiResponse<Map<String, Long>> getRoomAvailability() {
        long totalBeds = bedRepository.count();
        long occupiedBeds = bedRepository.countByStatus("OCCUPIED");
        long availableBeds = bedRepository.countByStatus("AVAILABLE");
        
        // Mock waiting list count for now
        long waitingListCount = 12;

        return ApiResponse.success("Room availability retrieved successfully", Map.of(
                "totalBeds", totalBeds,
                "occupiedBeds", occupiedBeds,
                "availableBeds", availableBeds,
                "waitingListCount", waitingListCount
        ));
    }

    @org.springframework.web.bind.annotation.PostMapping("/events")
    public ApiResponse<String> trackEvent(@org.springframework.web.bind.annotation.RequestBody Map<String, Object> payload) {
        String type = payload.getOrDefault("type", "UNKNOWN").toString();
        String source = payload.getOrDefault("source", "UNKNOWN").toString();
        String title = payload.getOrDefault("title", "").toString();
        String timestampStr = payload.getOrDefault("timestamp", LocalDateTime.now().toString()).toString();
        
        LocalDateTime timestamp;
        try {
            timestamp = LocalDateTime.parse(timestampStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            timestamp = LocalDateTime.now();
        }

        LandingPageEvent event = LandingPageEvent.builder()
                .type(type)
                .source(source)
                .title(title)
                .timestamp(timestamp)
                .build();
                
        landingPageEventRepository.save(event);
        return ApiResponse.success("Event tracked successfully", null);
    }
}
