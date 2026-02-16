package com.incidentnow.dto;

public record IncidentSummaryDTO(
        long totalIncidents,
        long openIncidents,
        long inProgressIncidents,
        long onHoldIncidents,
        long resolvedIncidents,
        long closedIncidents,
        long criticalIncidents,
        Double averageResolutionTimeMinutes,
        Double averageTimeToAcknowledgeMinutes,
        long slaBreachCount,
        Double slaCompliancePercentage) {
}
