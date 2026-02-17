package com.incidentnow.dto;

import com.incidentnow.model.IncidentCategory;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record SupportEngineerSummaryDTO(
        UUID id,
        String name,
        String email,
        String avatarUrl,
        boolean onCall,
        List<IncidentCategory> categories) {
}
