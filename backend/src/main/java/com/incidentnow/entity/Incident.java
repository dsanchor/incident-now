package com.incidentnow.entity;

import com.incidentnow.model.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String incidentNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private IncidentStatus status = IncidentStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentCategory category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "incident_tags", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "incident_affected_systems", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "system_name")
    @Builder.Default
    private List<String> affectedSystems = new ArrayList<>();

    private Integer affectedUsers;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "incident_assignees", joinColumns = @JoinColumn(name = "incident_id"), inverseJoinColumns = @JoinColumn(name = "support_engineer_id"))
    @Builder.Default
    private Set<SupportEngineer> assignees = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(columnDefinition = "TEXT")
    private String workaround;

    @Embedded
    private GitHubRepo githubRepo;

    private LocalDateTime dueDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime acknowledgedAt;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean slaBreached = false;

    private Integer timeToAcknowledge;

    private Integer timeToResolve;
}
