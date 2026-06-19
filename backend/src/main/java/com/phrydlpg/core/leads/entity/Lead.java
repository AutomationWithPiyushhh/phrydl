package com.phrydlpg.core.leads.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String mobileNumber;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String occupation;

    @Column(nullable = false)
    private String preferredLocation;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private LocalDate moveInDate;

    @Column(length = 1000)
    private String additionalRequirements;

    @Column(nullable = false)
    private String source; // BOOK_ROOM, SCHEDULE_VISIT, CONTACT_FORM

    @Column
    private String assignedTo;

    @Column(length = 2000)
    private String remarks;

    @Builder.Default
    @Column(nullable = false)
    private String status = "NEW"; // NEW, CONTACTED, VISIT_SCHEDULED, NEGOTIATION, CONVERTED, LOST, REJECTED

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
