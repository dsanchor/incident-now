package com.incidentnow.dto;

import com.incidentnow.model.IncidentCategory;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record SupportEngineerResponseDTO(
        UUID id,
        String name,
        String email,
        String phone,
        String avatarUrl,
        String timezone,
        String slackHandle,
        String githubUsername,
        boolean active,
        boolean onCall,
        LocalTime workingHoursStart,
        LocalTime workingHoursEnd,
        List<IncidentCategory> categories,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
