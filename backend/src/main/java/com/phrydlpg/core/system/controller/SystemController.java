package com.phrydlpg.core.system.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.system.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
@RequiredArgsConstructor
public class SystemController {

    private final BackupService backupService;

    @PostMapping("/backup")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ApiResponse<String> triggerBackup() {
        new Thread(() -> backupService.performBackup()).start();
        return ApiResponse.success("Backup process triggered successfully in the background", null);
    }
}
