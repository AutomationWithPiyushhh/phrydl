package com.phrydlpg.core.payments.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.payments.entity.TenantLedger;
import com.phrydlpg.core.payments.repository.TenantLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenant/ledger")
@RequiredArgsConstructor
public class TenantLedgerController {

    private final TenantLedgerRepository tenantLedgerRepository;

    @GetMapping("/{tenantId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<TenantLedger>> getTenantLedger(@PathVariable UUID tenantId) {
        return ApiResponse.success("Ledger retrieved successfully", tenantLedgerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId));
    }
}
