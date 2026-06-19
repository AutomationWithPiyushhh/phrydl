package com.phrydlpg.core.payments.repository;

import com.phrydlpg.core.payments.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    List<Invoice> findByTenantId(UUID tenantId);
    List<Invoice> findByPropertyId(UUID propertyId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByStatus(com.phrydlpg.core.payments.entity.InvoiceStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID'")
    java.math.BigDecimal sumPaidInvoices();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status != 'PAID'")
    java.math.BigDecimal sumUnpaidInvoices();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status = 'PAID' AND i.createdAt >= :startDate AND i.createdAt <= :endDate")
    java.math.BigDecimal sumPaidInvoicesBetween(
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate
    );
}
