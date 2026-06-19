package com.phrydlpg.core.notifications.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.notifications.dto.NotificationDto;
import com.phrydlpg.core.notifications.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ApiResponse<List<NotificationDto>> getMyNotifications() {
        return ApiResponse.success("Notifications retrieved", notificationService.getMyNotifications());
    }

    @PostMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Notification marked as read", null);
    }
}
