package com.phrydlpg.core.payments.gateway;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentInitiationResponse {
    private String orderId;
    private String gatewayId;
    private String amount;
    private String currency;
}
