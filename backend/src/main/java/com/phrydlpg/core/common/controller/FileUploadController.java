package com.phrydlpg.core.common.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.common.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam("folder") String folder) {
        String fileName = fileStorageService.uploadFile(file, folder);
        String url = fileStorageService.getFileUrl(fileName);
        return ApiResponse.success("File uploaded successfully", url);
    }
}
