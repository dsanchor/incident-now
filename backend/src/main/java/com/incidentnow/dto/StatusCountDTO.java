package com.incidentnow.dto;

import com.incidentnow.model.IncidentCategory;
import com.incidentnow.model.IncidentStatus;
import com.incidentnow.model.Priority;

public record StatusCountDTO(IncidentStatus status, long count) {
}
