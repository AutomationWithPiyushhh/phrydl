package com.phrydlpg.core.tenants.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String phoneNumber;
    private String emergencyContact;
    private String address;
}
