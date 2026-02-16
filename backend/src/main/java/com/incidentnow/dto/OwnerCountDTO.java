package com.incidentnow.dto;

public record OwnerCountDTO(
        OwnerSummaryDTO owner,
        long totalIncidents,
        long openIncidents,
        long resolvedIncidents) {
}
