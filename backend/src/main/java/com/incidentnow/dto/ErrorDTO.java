package com.incidentnow.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorDTO(
        String code,
        String message,
        List<FieldError> details,
        String traceId,
        LocalDateTime timestamp) {
    public record FieldError(String field, String message) {
    }

    public static ErrorDTO of(String code, String message) {
        return new ErrorDTO(code, message, null, null, LocalDateTime.now());
    }

    public static ErrorDTO of(String code, String message, List<FieldError> details) {
        return new ErrorDTO(code, message, details, null, LocalDateTime.now());
    }
}
