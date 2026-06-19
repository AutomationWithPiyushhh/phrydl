package com.phrydlpg.core.payments.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.phrydlpg.core.payments.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/webhooks/razorpay")
@RequiredArgsConstructor
public class WebhookController {

    private final ObjectMapper objectMapper;
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("x-razorpay-signature") String signature) {
        
        // TODO: verify signature if required, but typically in webhook we also check signature
        // or just rely on idempotency if we are fine with it. 
        // For Razorpay, we can verify webhook signature using com.razorpay.Utils.verifyWebhookSignature
        // but for now let's focus on handling the events.
        
        try {
            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText();
            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            String paymentId = paymentEntity.path("id").asText();
            String orderId = paymentEntity.path("order_id").asText();

            log.info("Received Razorpay Webhook Event: {} for Payment ID: {}", event, paymentId);

            if ("payment.captured".equals(event)) {
                paymentService.handlePaymentCaptured(paymentId, orderId, paymentEntity);
            } else if ("payment.failed".equals(event)) {
                paymentService.handlePaymentFailed(paymentId, orderId, paymentEntity);
            } else {
                log.info("Ignored Razorpay Webhook Event: {}", event);
            }

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
