package com.incidentnow.dto;

import com.incidentnow.model.IncidentCategory;

public record CategoryCountDTO(IncidentCategory category, long count) {
}
