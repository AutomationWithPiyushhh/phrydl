package com.phrydlpg.core.payments.repository;
import com.phrydlpg.core.payments.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByInvoice_Tenant_Id(UUID tenantId);
    
    Optional<Payment> findByTransactionRef(String transactionRef);
    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.paymentDate >= :startDate AND p.paymentDate <= :endDate")
    java.math.BigDecimal sumByStatusAndPaymentDateBetween(
            @org.springframework.data.repository.query.Param("status") com.phrydlpg.core.payments.entity.PaymentStatus status,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDateTime endDate
    );
}
