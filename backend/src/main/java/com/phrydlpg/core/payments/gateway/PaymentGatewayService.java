package com.phrydlpg.core.payments.gateway;

import java.math.BigDecimal;

public interface PaymentGatewayService {
    PaymentInitiationResponse initiatePayment(BigDecimal amount, String currency, String receiptInfo);
    boolean verifyPayment(String paymentId, String orderId, String signature);
}
