package com.incidentnow.entity;

import com.incidentnow.model.IncidentCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Entity
@Table(name = "support_engineers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportEngineer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String avatarUrl;

    private String timezone;

    private String slackHandle;

    private String githubUsername;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean onCall = false;

    private LocalTime workingHoursStart;

    private LocalTime workingHoursEnd;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "support_engineer_categories", joinColumns = @JoinColumn(name = "support_engineer_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    @Builder.Default
    private List<IncidentCategory> categories = new ArrayList<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
