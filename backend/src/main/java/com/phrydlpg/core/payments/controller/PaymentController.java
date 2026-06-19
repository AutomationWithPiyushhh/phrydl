package com.phrydlpg.core.payments.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.payments.dto.PaymentDto;
import com.phrydlpg.core.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<List<PaymentDto>> getAllPayments() {
        return ApiResponse.success("Payments retrieved successfully", paymentService.getAllPayments());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROPERTY_ADMIN', 'MANAGER')")
    public ApiResponse<com.phrydlpg.core.payments.dto.PaymentStatsDto> getPaymentStats() {
        return ApiResponse.success("Payment stats retrieved successfully", paymentService.getPaymentStats());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'MANAGER')")
    public ApiResponse<PaymentDto> recordPayment(@RequestBody PaymentDto dto) {
        return ApiResponse.success("Payment recorded successfully", paymentService.recordPayment(dto));
    }
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGION_MANAGER')")
    public ApiResponse<String> refundPayment(
            @PathVariable java.util.UUID id, 
            @RequestBody java.util.Map<String, String> payload, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.phrydlpg.core.auth.security.UserDetailsImpl userDetails) {
        paymentService.refundPayment(id, userDetails.getId(), payload.get("reason"));
        return ApiResponse.success("Payment refunded successfully", null);
    }
}
