package com.incidentnow.dto;

public record TrendDataDTO(
        String period,
        long created,
        long resolved,
        long closed) {
}
