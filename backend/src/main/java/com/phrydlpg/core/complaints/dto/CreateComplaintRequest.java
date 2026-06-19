package com.phrydlpg.core.complaints.dto;

import lombok.Data;

@Data
public class CreateComplaintRequest {
    private String title;
    private String description;
    private String category;
    private String priority;
}
