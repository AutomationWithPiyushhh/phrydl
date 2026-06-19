package com.phrydlpg.core.tenants.service;

import com.phrydlpg.core.complaints.repository.ComplaintRepository;
import com.phrydlpg.core.complaints.dto.ComplaintDto;
import com.phrydlpg.core.complaints.dto.CreateComplaintRequest;
import com.phrydlpg.core.complaints.entity.Complaint;
import com.phrydlpg.core.complaints.repository.ComplaintRepository;
import com.phrydlpg.core.notifications.entity.Notice;
import com.phrydlpg.core.notifications.repository.NoticeRepository;
import com.phrydlpg.core.payments.dto.PaymentDto;
import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.entity.Payment;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.payments.repository.PaymentRepository;
import com.phrydlpg.core.payments.gateway.PaymentGatewayService;
import com.phrydlpg.core.payments.gateway.PaymentInitiationResponse;
import com.phrydlpg.core.tenants.dto.TenantDashboardDto;
import com.phrydlpg.core.tenants.dto.UpdateProfileRequest;
import com.phrydlpg.core.tenants.dto.ChangePasswordRequest;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.users.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TenantPortalService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final NoticeRepository noticeRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final PasswordEncoder passwordEncoder;

    public TenantDashboardDto getDashboardData(UUID userId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        List<TenantDashboardDto.QuickComplaintDto> complaints = complaintRepository.findByTenant_Id(tenant.getId())
                .stream()
                .map(c -> TenantDashboardDto.QuickComplaintDto.builder()
                        .id(c.getId().toString())
                        .title(c.getTitle())
                        .status(c.getStatus())
                        .build())
                .collect(Collectors.toList());

        // Dummy Notices for now since we don't have a Notice entity - Wait we do
        List<Notice> actualNotices = noticeRepository.findByPropertyIdOrderByCreatedAtDesc(tenant.getBed() != null ? tenant.getBed().getRoom().getProperty().getId() : null);
        List<TenantDashboardDto.NoticeDto> notices = actualNotices.stream().map(n -> TenantDashboardDto.NoticeDto.builder()
                .title(n.getTitle())
                .content(n.getContent())
                .date(n.getCreatedAt().toLocalDate().toString())
                .build()).collect(Collectors.toList());

        return TenantDashboardDto.builder()
                .name(tenant.getUser().getFirstName())
                .propertyName(tenant.getBed() != null ? tenant.getBed().getRoom().getProperty().getName() : "Unassigned")
                .roomNumber(tenant.getBed() != null ? tenant.getBed().getRoom().getRoomNumber() : "Unassigned")
                .kycStatus(tenant.getKycStatus())
                .currentRentDue(tenant.getMonthlyRent())
                .rentDueDate(LocalDate.now().plusDays(4)) // Mocked for display
                .activeNotices(notices)
                .activeComplaints(complaints)
                .build();
    }

    public List<PaymentDto> getTenantPayments(UUID userId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        return paymentRepository.findByInvoice_Tenant_Id(tenant.getId())
                .stream()
                .map(p -> PaymentDto.builder()
                        .id(p.getId())
                        .amount(p.getAmount())
                        .type(p.getType())
                        .method(p.getMethod())
                        .status(p.getStatus().name())
                        .referenceId(p.getTransactionRef())
                        .paymentDate(p.getPaymentDate())
                        .build())
                .collect(Collectors.toList());
    }

    public List<Invoice> getTenantInvoices(UUID userId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        return invoiceRepository.findByTenantId(tenant.getId());
    }

    public List<Notice> getTenantCommunityNotices(UUID userId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));
        if (tenant.getBed() == null) return List.of();
        return noticeRepository.findByPropertyIdOrderByCreatedAtDesc(tenant.getBed().getRoom().getProperty().getId());
    }

    public List<ComplaintDto> getTenantComplaints(UUID userId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        return complaintRepository.findByTenant_Id(tenant.getId())
                .stream()
                .map(c -> ComplaintDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .category("General") // Complaint entity does not have category
                        .priority(c.getPriority())
                        .status(c.getStatus())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public ComplaintDto createTenantComplaint(UUID userId, CreateComplaintRequest request) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        Complaint complaint = Complaint.builder()
                .tenant(tenant)
                .property(tenant.getBed().getRoom().getProperty())
                .ticketRef("TKT-" + System.currentTimeMillis())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : "Medium")
                .status("OPEN")
                .build();

        Complaint saved = complaintRepository.save(complaint);

        return ComplaintDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .category("General")
                .priority(saved.getPriority())
                .status(saved.getStatus())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public PaymentInitiationResponse initiatePayment(UUID userId, UUID paymentId) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getInvoice().getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized access to payment");
        }

        if (com.phrydlpg.core.payments.entity.PaymentStatus.SUCCESS.equals(payment.getStatus())) {
            throw new RuntimeException("Payment already completed");
        }

        return paymentGatewayService.initiatePayment(payment.getAmount(), "INR", "Payment for " + payment.getType());
    }

    public PaymentDto verifyPayment(UUID userId, UUID paymentId, Map<String, String> payload) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (!payment.getInvoice().getTenant().getId().equals(tenant.getId())) {
            throw new RuntimeException("Unauthorized access to payment");
        }

        boolean verified = paymentGatewayService.verifyPayment(
                payload.get("paymentId"),
                payload.get("orderId"),
                payload.get("signature")
        );

        if (verified) {
            payment.setStatus(com.phrydlpg.core.payments.entity.PaymentStatus.SUCCESS);
            payment.setGatewayPaymentId(payload.get("paymentId"));
            payment.setGatewayOrderId(payload.get("orderId"));
            payment.setGatewaySignature(payload.get("signature"));
            payment.setTransactionRef(payload.getOrDefault("paymentId", UUID.randomUUID().toString()));
            payment.setPaymentDate(java.time.LocalDateTime.now());
            paymentRepository.save(payment);
        } else {
            payment.setStatus(com.phrydlpg.core.payments.entity.PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);
            throw new RuntimeException("Payment verification failed");
        }

        return PaymentDto.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .type(payment.getType())
                .method(payment.getMethod())
                .status(payment.getStatus().name())
                .referenceId(payment.getTransactionRef())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    public void updateProfile(UUID userId, UpdateProfileRequest request) {
        Tenant tenant = tenantRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for current user"));

        User user = tenant.getUser();
        user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);

        tenant.setEmergencyContact(request.getEmergencyContact());
        tenant.setPermanentAddress(request.getAddress());
        tenantRepository.save(tenant);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
