package com.phrydlpg.core.payments.gateway;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Primary
@Service
public class RazorpayServiceImpl implements PaymentGatewayService {

    @Value("${razorpay.key.id:mock_key_id}")
    private String keyId;

    @Value("${razorpay.key.secret:mock_key_secret}")
    private String keySecret;

    @Override
    public PaymentInitiationResponse initiatePayment(BigDecimal amount, String currency, String receiptInfo) {
        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise (smallest currency unit)
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue()); 
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receiptInfo);

            Order order = razorpay.orders.create(orderRequest);
            
            return new PaymentInitiationResponse(
                    order.get("id"),
                    "razorpay",
                    amount.toString(),
                    currency
            );
        } catch (RazorpayException e) {
            log.error("Error creating Razorpay order", e);
            throw new RuntimeException("Failed to initiate payment with Razorpay", e);
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, String orderId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }
}
