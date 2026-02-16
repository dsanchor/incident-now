package com.incidentnow.dto;

import com.incidentnow.model.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record IncidentCreateDTO(
        @NotBlank(message = "Title is required") @Size(max = 255, message = "Title must not exceed 255 characters") String title,

        @NotBlank(message = "Description is required") String description,

        @NotNull(message = "Priority is required") Priority priority,

        @NotNull(message = "Severity is required") Severity severity,

        @NotNull(message = "Category is required") IncidentCategory category,

        List<String> tags,
        List<String> affectedSystems,
        Integer affectedUsers,

        @NotNull(message = "Owner ID is required") UUID ownerId,

        List<UUID> assigneeIds,
        String workaround,
        GitHubRepoInputDTO githubRepo,
        LocalDateTime dueDate) {
}
