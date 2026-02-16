package com.incidentnow.dto;

import jakarta.validation.constraints.NotBlank;

public record IncidentResolutionDTO(
        String rootCause,

        @NotBlank(message = "Resolution description is required") String resolution) {
}
