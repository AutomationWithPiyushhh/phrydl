package com.phrydlpg.core.notifications.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationDto {
    private UUID id;
    private String title;
    private String message;
    private String type; // ALERT, INFO, SUCCESS, WARNING
    private boolean read;
    private LocalDateTime createdAt;
}
