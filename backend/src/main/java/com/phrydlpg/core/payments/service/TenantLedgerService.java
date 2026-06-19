package com.phrydlpg.core.payments.service;

import com.phrydlpg.core.payments.entity.Invoice;
import com.phrydlpg.core.payments.entity.Payment;
import com.phrydlpg.core.payments.entity.TenantLedger;
import com.phrydlpg.core.payments.entity.TransactionType;
import com.phrydlpg.core.payments.repository.TenantLedgerRepository;
import com.phrydlpg.core.tenants.entity.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TenantLedgerService {

    private final TenantLedgerRepository tenantLedgerRepository;

    @Transactional
    public void recordInvoice(Invoice invoice) {
        BigDecimal currentBalance = getCurrentBalance(invoice.getTenant().getId());
        BigDecimal newBalance = currentBalance.add(invoice.getTotalAmount()); // Charge increases balance owed
        
        TenantLedger ledgerEntry = TenantLedger.builder()
                .tenant(invoice.getTenant())
                .invoice(invoice)
                .transactionType(TransactionType.DEBIT)
                .amount(invoice.getTotalAmount())
                .balance(newBalance)
                .description("Invoice " + invoice.getId() + " generated")
                .build();
                
        tenantLedgerRepository.save(ledgerEntry);
    }

    @Transactional
    public void recordPayment(Payment payment) {
        BigDecimal currentBalance = getCurrentBalance(payment.getInvoice().getTenant().getId());
        BigDecimal newBalance = currentBalance.subtract(payment.getAmount()); // Payment decreases balance owed
        
        TenantLedger ledgerEntry = TenantLedger.builder()
                .tenant(payment.getInvoice().getTenant())
                .payment(payment)
                .invoice(payment.getInvoice())
                .transactionType(TransactionType.CREDIT)
                .amount(payment.getAmount())
                .balance(newBalance)
                .description("Payment received for invoice " + payment.getInvoice().getId())
                .build();
                
        tenantLedgerRepository.save(ledgerEntry);
    }

    @Transactional
    public void recordLateFee(Tenant tenant, BigDecimal lateFeeAmount, Invoice invoice) {
        BigDecimal currentBalance = getCurrentBalance(tenant.getId());
        BigDecimal newBalance = currentBalance.add(lateFeeAmount);
        
        TenantLedger ledgerEntry = TenantLedger.builder()
                .tenant(tenant)
                .invoice(invoice)
                .transactionType(TransactionType.DEBIT)
                .amount(lateFeeAmount)
                .balance(newBalance)
                .description("Late fee applied to invoice " + invoice.getId())
                .build();
                
        tenantLedgerRepository.save(ledgerEntry);
    }

    private BigDecimal getCurrentBalance(java.util.UUID tenantId) {
        return tenantLedgerRepository.findLatestByTenantId(tenantId)
                .map(TenantLedger::getBalance)
                .orElse(BigDecimal.ZERO);
    }
}
