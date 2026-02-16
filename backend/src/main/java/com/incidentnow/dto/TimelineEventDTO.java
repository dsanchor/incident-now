package com.incidentnow.dto;

import com.incidentnow.model.TimelineEventType;

import java.time.LocalDateTime;
import java.util.UUID;

public record TimelineEventDTO(
        UUID id,
        UUID incidentId,
        TimelineEventType eventType,
        String description,
        String previousValue,
        String newValue,
        OwnerSummaryDTO actor,
        LocalDateTime timestamp) {
}
