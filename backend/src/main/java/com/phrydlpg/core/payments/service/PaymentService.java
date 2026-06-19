package com.phrydlpg.core.payments.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.phrydlpg.core.payments.dto.PaymentDto;
import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.entity.InvoiceStatus;
import com.phrydlpg.core.payments.entity.Payment;
import com.phrydlpg.core.payments.entity.PaymentStatus;
import com.phrydlpg.core.payments.gateway.PaymentGatewayService;
import com.phrydlpg.core.payments.gateway.PaymentInitiationResponse;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.payments.repository.PaymentRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import com.phrydlpg.core.common.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditLogRepository auditLogRepository;
    private final PaymentGatewayService paymentGatewayService;
    private final TenantLedgerService tenantLedgerService;
    private final com.phrydlpg.core.payments.repository.RefundRepository refundRepository;
    private final com.phrydlpg.core.users.repository.UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public PaymentInitiationResponse initiatePayment(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice is already paid");
        }

        BigDecimal amount = invoice.getTotalAmount();
        
        PaymentInitiationResponse response = paymentGatewayService.initiatePayment(
                amount, "INR", "Receipt for Invoice " + invoice.getId()
        );

        // Save a pending payment record
        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(amount)
                .type("ONLINE") // Or based on DTO
                .method("RAZORPAY")
                .status(PaymentStatus.PENDING)
                .transactionRef(response.getOrderId()) // order ID from Razorpay
                .paymentDate(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        return response;
    }

    @Transactional
    public PaymentDto recordPayment(PaymentDto dto) {
        Tenant tenant = tenantRepository.findById(dto.getTenantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        Invoice invoice = invoiceRepository.findByTenantId(tenant.getId()).stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No pending invoice found for tenant"));

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(dto.getAmount())
                .type(dto.getType())
                .method(dto.getMethod())
                .status(PaymentStatus.SUCCESS)
                .transactionRef(UUID.randomUUID().toString()) // Manual record might not have real ref
                .paymentDate(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice status (simple logic for now)
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        // Update TenantLedger via TenantLedgerService
        tenantLedgerService.recordPayment(savedPayment);

        com.phrydlpg.core.common.entity.AuditLog auditLog = com.phrydlpg.core.common.entity.AuditLog.builder()
                .entityType("PAYMENT")
                .entityId(savedPayment.getId().toString())
                .action("CREATED")
                .details("Manual payment of " + savedPayment.getAmount() + " recorded for tenant " + tenant.getId())
                .performedBy("SYSTEM")
                .build();
        auditLogRepository.save(auditLog);

        messagingTemplate.convertAndSend("/topic/kpi-updates", "New Payment Recorded: " + savedPayment.getAmount());

        return mapToDto(savedPayment);
    }

    @Transactional
    public void handlePaymentCaptured(String paymentId, String orderId, JsonNode paymentEntity) {
        Optional<Payment> paymentOpt = paymentRepository.findByGatewayOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findByTransactionRef(orderId);
        }
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            
            // Check Idempotency
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.info("Payment for order {} is already processed successfully. Ignoring webhook.", orderId);
                return;
            }

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayPaymentId(paymentId); // Update actual gateway payment ID
            payment.setPaymentDate(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);

            Invoice invoice = payment.getInvoice();
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);

            tenantLedgerService.recordPayment(savedPayment);
            
            log.info("Payment captured and ledger updated for order: {}", orderId);
        } else {
            log.warn("Payment record not found for orderId: {}", orderId);
        }
    }

    @Transactional
    public void handlePaymentFailed(String paymentId, String orderId, JsonNode paymentEntity) {
        Optional<Payment> paymentOpt = paymentRepository.findByGatewayOrderId(orderId);
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findByTransactionRef(orderId);
        }
        
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                log.warn("Received failed webhook for order {} but payment is already SUCCESS.", orderId);
                return;
            }

            payment.setStatus(PaymentStatus.FAILED);
            payment.setGatewayPaymentId(paymentId);
            paymentRepository.save(payment);
            
            log.info("Payment failed for order: {}", orderId);
        } else {
            log.warn("Payment record not found for orderId: {}", orderId);
        }
    }

    private PaymentDto mapToDto(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .type(payment.getType())
                .method(payment.getMethod())
                .status(payment.getStatus().name())
                .referenceId(payment.getTransactionRef())
                .paymentDate(payment.getPaymentDate())
                .tenantId(payment.getInvoice().getTenant().getId())
                .tenantName(payment.getInvoice().getTenant().getUser().getFirstName() + " " + payment.getInvoice().getTenant().getUser().getLastName())
                .propertyName(payment.getInvoice().getTenant().getBed() != null && payment.getInvoice().getTenant().getBed().getRoom() != null ? 
                    payment.getInvoice().getTenant().getBed().getRoom().getProperty().getName() : "N/A")
                .build();
    }

    public com.phrydlpg.core.payments.dto.PaymentStatsDto getPaymentStats() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfMonth = LocalDateTime.now().withDayOfMonth(YearMonth.now().lengthOfMonth()).withHour(23).withMinute(59).withSecond(59);

        BigDecimal mtdCollection = paymentRepository.sumByStatusAndPaymentDateBetween(PaymentStatus.SUCCESS, startOfMonth, endOfMonth);
        BigDecimal outstandingDues = invoiceRepository.sumUnpaidInvoices();
        BigDecimal totalDepositsHeld = tenantRepository.sumSecurityDepositByStatus("ACTIVE");

        return com.phrydlpg.core.payments.dto.PaymentStatsDto.builder()
                .mtdCollection(mtdCollection != null ? mtdCollection : BigDecimal.ZERO)
                .outstandingDues(outstandingDues != null ? outstandingDues : BigDecimal.ZERO)
                .totalDepositsHeld(totalDepositsHeld != null ? totalDepositsHeld : BigDecimal.ZERO)
                .build();
    }

    @Transactional
    public void refundPayment(UUID paymentId, UUID approverId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only SUCCESS payments can be refunded");
        }

        com.phrydlpg.core.users.entity.User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Approver not found"));

        // Mock Razorpay refund
        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        com.phrydlpg.core.payments.entity.Refund refund = com.phrydlpg.core.payments.entity.Refund.builder()
                .payment(payment)
                .approvedBy(approver)
                .amount(payment.getAmount())
                .reason(reason)
                .status("COMPLETED")
                .requestedAt(LocalDateTime.now())
                .build();
        refundRepository.save(refund);

        log.info("Payment {} refunded by {}", paymentId, approver.getEmail());
    }
}
