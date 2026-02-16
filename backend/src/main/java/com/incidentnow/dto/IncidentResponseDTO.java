package com.incidentnow.dto;

import com.incidentnow.model.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record IncidentResponseDTO(
        UUID id,
        String incidentNumber,
        String title,
        String description,
        IncidentStatus status,
        Priority priority,
        Severity severity,
        IncidentCategory category,
        List<String> tags,
        List<String> affectedSystems,
        Integer affectedUsers,
        OwnerSummaryDTO owner,
        List<OwnerSummaryDTO> assignees,
        String rootCause,
        String resolution,
        String workaround,
        GitHubRepoDTO githubRepo,
        LocalDateTime dueDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime acknowledgedAt,
        LocalDateTime resolvedAt,
        LocalDateTime closedAt,
        boolean slaBreached,
        Integer timeToAcknowledge,
        Integer timeToResolve) {
}
