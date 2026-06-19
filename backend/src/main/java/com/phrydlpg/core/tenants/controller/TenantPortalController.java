package com.phrydlpg.core.tenants.controller;

import com.phrydlpg.core.auth.security.UserDetailsImpl;
import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.complaints.dto.ComplaintDto;
import com.phrydlpg.core.payments.dto.PaymentDto;
import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.tenants.dto.TenantDashboardDto;
import com.phrydlpg.core.tenants.service.TenantPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import com.phrydlpg.core.payments.gateway.PaymentInitiationResponse;
import com.phrydlpg.core.complaints.dto.CreateComplaintRequest;
import com.phrydlpg.core.tenants.dto.UpdateProfileRequest;
import com.phrydlpg.core.tenants.dto.ChangePasswordRequest;
import com.phrydlpg.core.notifications.service.NotificationService;
import com.phrydlpg.core.notifications.dto.NotificationDto;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TENANT')")
public class TenantPortalController {

    private final TenantPortalService tenantPortalService;
    private final NotificationService notificationService;

    @GetMapping("/dashboard")
    public ApiResponse<TenantDashboardDto> getTenantDashboard() {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Dashboard data retrieved successfully", tenantPortalService.getDashboardData(userId));
    }

    @GetMapping("/payments")
    public ApiResponse<List<PaymentDto>> getTenantPayments() {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Payments retrieved successfully", tenantPortalService.getTenantPayments(userId));
    }

    @GetMapping("/invoices")
    public ApiResponse<List<Invoice>> getTenantInvoices() {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Invoices retrieved successfully", tenantPortalService.getTenantInvoices(userId));
    }

    @GetMapping("/complaints")
    public ApiResponse<List<ComplaintDto>> getTenantComplaints() {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Complaints retrieved successfully", tenantPortalService.getTenantComplaints(userId));
    }

    @GetMapping("/notifications")
    public ApiResponse<List<NotificationDto>> getTenantNotifications() {
        return ApiResponse.success("Notifications retrieved successfully", notificationService.getMyNotifications());
    }

    @GetMapping("/community-notices")
    public ApiResponse<List<com.phrydlpg.core.notifications.entity.Notice>> getCommunityNotices() {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Community notices retrieved", tenantPortalService.getTenantCommunityNotices(userId));
    }

    @PostMapping("/notifications/{notificationId}/read")
    public ApiResponse<String> markNotificationAsRead(@PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId);
        return ApiResponse.success("Notification marked as read", null);
    }

    @PostMapping("/complaints")
    public ApiResponse<ComplaintDto> createTenantComplaint(@RequestBody CreateComplaintRequest request) {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Complaint created successfully", tenantPortalService.createTenantComplaint(userId, request));
    }

    @PostMapping("/payments/{paymentId}/initiate")
    public ApiResponse<PaymentInitiationResponse> initiatePayment(@PathVariable UUID paymentId) {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Payment initiated successfully", tenantPortalService.initiatePayment(userId, paymentId));
    }

    @PostMapping("/payments/{paymentId}/verify")
    public ApiResponse<PaymentDto> verifyPayment(@PathVariable UUID paymentId, @RequestBody Map<String, String> payload) {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        return ApiResponse.success("Payment verified successfully", tenantPortalService.verifyPayment(userId, paymentId, payload));
    }

    @PutMapping("/profile")
    public ApiResponse<String> updateProfile(@RequestBody UpdateProfileRequest request) {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        tenantPortalService.updateProfile(userId, request);
        return ApiResponse.success("Profile updated successfully", null);
    }

    @PostMapping("/settings/password")
    public ApiResponse<String> changePassword(@RequestBody ChangePasswordRequest request) {
        UUID userId = ((UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
        tenantPortalService.changePassword(userId, request);
        return ApiResponse.success("Password changed successfully", null);
    }
}
