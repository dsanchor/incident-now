package com.incidentnow.controller;

import com.incidentnow.dto.*;
import com.incidentnow.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private static final Logger log = LoggerFactory.getLogger(StatisticsController.class);

    private final StatisticsService statisticsService;

    @GetMapping("/summary")
    public ResponseEntity<IncidentSummaryDTO> getIncidentSummary(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        log.info("GET /statistics/summary - from: {}, to: {}", from, to);
        IncidentSummaryDTO response = statisticsService.getIncidentSummary(from, to);
        log.info("GET /statistics/summary - total: {}", response.totalIncidents());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<StatusCountDTO>> getIncidentsByStatus() {
        log.info("GET /statistics/by-status");
        List<StatusCountDTO> response = statisticsService.getIncidentsByStatus();
        log.info("GET /statistics/by-status - returned {} groups", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-priority")
    public ResponseEntity<List<PriorityCountDTO>> getIncidentsByPriority() {
        log.info("GET /statistics/by-priority");
        List<PriorityCountDTO> response = statisticsService.getIncidentsByPriority();
        log.info("GET /statistics/by-priority - returned {} groups", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<CategoryCountDTO>> getIncidentsByCategory() {
        log.info("GET /statistics/by-category");
        List<CategoryCountDTO> response = statisticsService.getIncidentsByCategory();
        log.info("GET /statistics/by-category - returned {} groups", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-owner")
    public ResponseEntity<List<OwnerCountDTO>> getIncidentsByOwner(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("GET /statistics/by-owner - limit: {}", limit);
        List<OwnerCountDTO> response = statisticsService.getIncidentsByOwner(limit);
        log.info("GET /statistics/by-owner - returned {} owners", response.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resolution-time")
    public ResponseEntity<ResolutionTimeStatsDTO> getResolutionTimeStats(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "week") String groupBy) {
        log.info("GET /statistics/resolution-time - from: {}, to: {}, groupBy: {}", from, to, groupBy);
        ResolutionTimeStatsDTO response = statisticsService.getResolutionTimeStats(from, to, groupBy);
        log.info("GET /statistics/resolution-time - avg: {} min", response.averageMinutes());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendDataDTO>> getIncidentTrends(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "week") String groupBy) {
        log.info("GET /statistics/trends - from: {}, to: {}, groupBy: {}", from, to, groupBy);
        List<TrendDataDTO> response = statisticsService.getIncidentTrends(from, to, groupBy);
        log.info("GET /statistics/trends - returned {} periods", response.size());
        return ResponseEntity.ok(response);
    }
}
