package com.phrydlpg.core.payments.controller;

import com.phrydlpg.core.common.dto.ApiResponse;
import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.payments.service.BillingAutomationScheduler;
import com.phrydlpg.core.payments.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;
    private final BillingAutomationScheduler billingAutomationScheduler;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<String> triggerManualGeneration() {
        billingAutomationScheduler.generateMonthlyRentInvoices();
        return ApiResponse.success("Invoices generated successfully", null);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ApiResponse<List<Invoice>> getAllInvoices() {
        return ApiResponse.success("Invoices retrieved", invoiceRepository.findAll());
    }

    @GetMapping("/tenant/{tenantId}")
    @PreAuthorize("hasAnyRole('TENANT', 'ADMIN', 'MANAGER')")
    public ApiResponse<List<Invoice>> getTenantInvoices(@PathVariable UUID tenantId) {
        return ApiResponse.success("Tenant invoices retrieved", invoiceRepository.findByTenantId(tenantId));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable UUID id) {
        byte[] pdfBytes = invoiceService.generateInvoicePdf(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
