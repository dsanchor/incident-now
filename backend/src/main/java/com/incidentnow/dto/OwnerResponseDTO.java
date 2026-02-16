package com.incidentnow.dto;

import com.incidentnow.model.OwnerRole;

import java.time.LocalDateTime;
import java.util.UUID;

public record OwnerResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        String team,
        OwnerRole role,
        String department,
        String timezone,
        String slackHandle,
        String githubUsername,
        boolean active,
        boolean onCall,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
