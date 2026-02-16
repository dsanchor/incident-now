package com.incidentnow.dto;

import com.incidentnow.model.OwnerRole;

import java.util.UUID;

public record OwnerSummaryDTO(
        UUID id,
        String name,
        String email,
        String avatarUrl,
        String team,
        OwnerRole role) {
}
