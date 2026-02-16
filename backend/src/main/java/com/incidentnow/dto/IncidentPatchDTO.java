package com.incidentnow.dto;

import com.incidentnow.model.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record IncidentPatchDTO(
        @Size(max = 255, message = "Title must not exceed 255 characters") String title,

        String description,
        IncidentStatus status,
        Priority priority,
        Severity severity,
        IncidentCategory category,
        List<String> tags,
        List<String> affectedSystems,
        Integer affectedUsers,
        UUID ownerId,
        List<UUID> assigneeIds,
        String rootCause,
        String resolution,
        String workaround,
        GitHubRepoInputDTO githubRepo,
        LocalDateTime dueDate) {
}
