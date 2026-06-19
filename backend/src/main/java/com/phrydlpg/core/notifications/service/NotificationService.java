package com.phrydlpg.core.notifications.service;

import com.phrydlpg.core.notifications.dto.NotificationDto;
import com.phrydlpg.core.notifications.entity.Notification;
import com.phrydlpg.core.notifications.repository.NotificationRepository;
import com.phrydlpg.core.users.entity.User;
import com.phrydlpg.core.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public List<NotificationDto> getMyNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void markAsRead(java.util.UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void notifyAdmins(String title, String message, String type) {
        userRepository.findAll().stream()
            .filter(u -> u.getRole().name().equals("ADMIN") || u.getRole().name().equals("SUPER_ADMIN") || u.getRole().name().equals("MANAGER"))
            .forEach(u -> {
                Notification notification = notificationRepository.save(Notification.builder()
                        .user(u)
                        .title(title)
                        .message(message)
                        .type(type)
                        .read(false)
                        .build());
                messagingTemplate.convertAndSend("/topic/notifications/" + u.getId(), mapToDto(notification));
            });
    }

    public void notifyUser(java.util.UUID userId, String title, String message, String type) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build());
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, mapToDto(notification));
    }

    private NotificationDto mapToDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
