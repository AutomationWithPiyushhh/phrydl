package com.phrydlpg.core.payments.service;

import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.entity.InvoiceLineItem;
import com.phrydlpg.core.payments.entity.InvoiceStatus;
import com.phrydlpg.core.payments.repository.InvoiceRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingAutomationScheduler {

    private final TenantRepository tenantRepository;
    private final InvoiceRepository invoiceRepository;
    private final TenantLedgerService tenantLedgerService;

    // Run at 1 AM on the 1st day of every month
    @Scheduled(cron = "0 0 1 1 * ?")
    @Transactional
    public void generateMonthlyRentInvoices() {
        log.info("Starting monthly rent invoice generation...");
        List<Tenant> activeTenants = tenantRepository.findAll().stream()
                .filter(t -> "ACTIVE".equals(t.getStatus()))
                .toList();

        int count = 0;
        for (Tenant tenant : activeTenants) {
            BigDecimal rentAmount = tenant.getMonthlyRent();
            if (rentAmount == null || rentAmount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Invoice invoice = Invoice.builder()
                    .invoiceNumber("INV-" + System.currentTimeMillis())
                    .tenant(tenant)
                    .property(tenant.getBed() != null && tenant.getBed().getRoom() != null ? tenant.getBed().getRoom().getProperty() : null)
                    .billingMonth(YearMonth.now().toString())
                    .dueDate(LocalDate.now().plusDays(5)) // Due in 5 days
                    .status(InvoiceStatus.PENDING)
                    .amount(rentAmount)
                    .totalAmount(rentAmount)
                    .build();

            InvoiceLineItem lineItem = InvoiceLineItem.builder()
                    .invoice(invoice)
                    .description("Monthly Rent for " + LocalDate.now().getMonth().toString())
                    .amount(rentAmount)
                    .build();

            List<InvoiceLineItem> items = new ArrayList<>();
            items.add(lineItem);
            invoice.setLineItems(items);
            invoice.calculateTotalAmount();

            Invoice savedInvoice = invoiceRepository.save(invoice);
            tenantLedgerService.recordInvoice(savedInvoice);
            count++;
        }
        
        log.info("Finished monthly rent invoice generation. Created {} invoices.", count);
    }

    // Run at 2 AM every day to check for overdue invoices and apply late fees
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void applyLateFees() {
        log.info("Starting late fee application job...");
        List<Invoice> pendingInvoices = invoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PENDING)
                .toList();

        int count = 0;
        BigDecimal lateFeeAmount = new BigDecimal("100.00"); // Fixed 100 late fee for example

        for (Invoice invoice : pendingInvoices) {
            if (invoice.getDueDate() != null && invoice.getDueDate().isBefore(LocalDate.now())) {
                
                // Check if late fee already applied this month to avoid duplicate late fees
                boolean hasLateFee = false;
                if (invoice.getLineItems() != null) {
                    hasLateFee = invoice.getLineItems().stream()
                            .anyMatch(item -> item.getDescription() != null && item.getDescription().contains("Late Fee"));
                }

                if (!hasLateFee) {
                    InvoiceLineItem lateFeeItem = InvoiceLineItem.builder()
                            .invoice(invoice)
                            .description("Late Fee for overdue invoice")
                            .amount(lateFeeAmount)
                            .build();

                    if (invoice.getLineItems() == null) {
                        invoice.setLineItems(new ArrayList<>());
                    }
                    invoice.getLineItems().add(lateFeeItem);
                    
                    invoice.setLateFeeApplied(invoice.getLateFeeApplied() == null ? lateFeeAmount : invoice.getLateFeeApplied().add(lateFeeAmount));
                    invoice.calculateTotalAmount();

                    invoiceRepository.save(invoice);
                    
                    // We might need to update tenant ledger here. 
                    // To keep it simple, we don't recreate the ledger entry, 
                    // or we could add a new ledger entry just for the late fee.
                    // For now, let's assume the invoice total update handles it, but mathematically 
                    // we need to add a new DEBIT transaction to the ledger.
                    tenantLedgerService.recordLateFee(invoice.getTenant(), lateFeeAmount, invoice);

                    count++;
                }
            }
        }
        
        log.info("Finished late fee application job. Applied late fees to {} invoices.", count);
    }
}
