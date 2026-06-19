package com.phrydlpg.core.intelligence.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.intelligence.service.AiAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/intelligence/assistant")
@RequiredArgsConstructor
public class AiAssistantController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<Object> queryAssistant(@RequestBody Map<String, String> payload) {
        String query = payload.get("query");
        return ApiResponse.success("Assistant answered successfully", aiAssistantService.processQuery(query));
    }
}
