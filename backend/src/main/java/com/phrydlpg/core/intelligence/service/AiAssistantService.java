package com.phrydlpg.core.intelligence.service;

import com.phrydlpg.core.payments.repository.PaymentRepository;
import com.phrydlpg.core.properties.repository.PropertyRepository;
import com.phrydlpg.core.tenants.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAssistantService {

    private final PaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;

    public Map<String, Object> processQuery(String query) {
        String lowerQuery = query.toLowerCase();
        Map<String, Object> response = new HashMap<>();

        if (lowerQuery.contains("overdue") || lowerQuery.contains("payment")) {
            // Find tenants with overdue payments (mocked query logic based on DB)
            // For now, return mock structured data as required by frontend, but ideally queried from repositories.
            List<Map<String, String>> overdueTenants = List.of(
                Map.of("name", "Sneha Patel", "room", "105-B (HSR)", "amount", "₹14,000", "risk", "High Risk"),
                Map.of("name", "Vikram Reddy", "room", "201-B (Kormangala)", "amount", "₹12,500", "risk", "Medium Risk"),
                Map.of("name", "Amit Kumar", "room", "302 (Indiranagar)", "amount", "₹11,000", "risk", "Low Risk")
            );
            response.put("type", "overdue");
            response.put("data", overdueTenants);
            response.put("count", overdueTenants.size());
        } else if (lowerQuery.contains("forecast") || lowerQuery.contains("trend")) {
            List<Map<String, String>> forecast = List.of(
                Map.of("month", "July", "value", "+5.2%", "trend", "up"),
                Map.of("month", "August", "value", "+8.1%", "trend", "up"),
                Map.of("month", "September", "value", "-2.0%", "trend", "down")
            );
            response.put("type", "forecast");
            response.put("data", forecast);
            response.put("notice", "September shows a slight dip due to 14 standard lease expirations. I recommend sending early renewal offers.");
        } else if (lowerQuery.contains("occupancy")) {
            response.put("type", "text");
            response.put("text", "Overall occupancy across all properties is currently at 92%. HSR Layout has the highest at 98%, while Kormangala is at 85%.");
        } else if (lowerQuery.contains("vacant")) {
            response.put("type", "text");
            response.put("text", "Kormangala currently has 3 vacant rooms: 102-A, 105-B, and 204. All are 2-sharing rooms.");
        } else {
            response.put("type", "text");
            response.put("text", "Here's a summary of the requested information. The overall portfolio health remains strong at 94/100.");
        }

        return response;
    }
}
