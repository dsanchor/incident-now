package com.incidentnow.dto;

import java.util.List;

public record ResolutionTimeStatsDTO(
        Double averageMinutes,
        Double medianMinutes,
        Integer minMinutes,
        Integer maxMinutes,
        Double percentile90Minutes,
        List<PeriodData> data) {
    public record PeriodData(String period, Double averageMinutes, long count) {
    }
}
