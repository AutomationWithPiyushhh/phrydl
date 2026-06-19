package com.phrydlpg.core.payments.gateway;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class MockPaymentGatewayService implements PaymentGatewayService {

    @Override
    public PaymentInitiationResponse initiatePayment(BigDecimal amount, String currency, String receiptInfo) {
        // In a real integration (e.g. Razorpay), we would call their API to create an Order
        // and return the Order ID.
        String mockOrderId = "order_" + UUID.randomUUID().toString().substring(0, 8);
        return PaymentInitiationResponse.builder()
                .orderId(mockOrderId)
                .gatewayId("mock_gateway")
                .amount(amount.toString())
                .currency(currency)
                .build();
    }

    @Override
    public boolean verifyPayment(String paymentId, String orderId, String signature) {
        // In a real integration, we'd verify the HMAC SHA256 signature using our gateway secret
        return true;
    }
}
