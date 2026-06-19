package com.phrydlpg.core.notifications.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.notifications.entity.Notice;
import com.phrydlpg.core.notifications.repository.NoticeRepository;
import com.phrydlpg.core.properties.entity.Property;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.users.entity.User;
import com.phrydlpg.core.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeRepository noticeRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<Notice> createNotice(
            @RequestParam UUID propertyId,
            @RequestParam String title,
            @RequestParam String content) {

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByEmail(userEmail).orElseThrow();
        Property property = propertyRepository.findById(propertyId).orElseThrow();

        Notice notice = Notice.builder()
                .property(property)
                .title(title)
                .content(content)
                .author(author)
                .build();

        return ApiResponse.success("Notice created", noticeRepository.save(notice));
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasAnyRole('TENANT', 'ADMIN', 'MANAGER')")
    public ApiResponse<List<Notice>> getNotices(@PathVariable UUID propertyId) {
        return ApiResponse.success("Notices retrieved", noticeRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId));
    }
}
