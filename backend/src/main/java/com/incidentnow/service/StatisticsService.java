package com.incidentnow.service;

import com.incidentnow.config.DtoMapper;
import com.incidentnow.dto.*;
import com.incidentnow.entity.Incident;
import com.incidentnow.entity.Owner;
import com.incidentnow.model.*;
import com.incidentnow.repository.IncidentRepository;
import com.incidentnow.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService {

    private static final Logger log = LoggerFactory.getLogger(StatisticsService.class);

    private final IncidentRepository incidentRepository;
    private final OwnerRepository ownerRepository;
    private final DtoMapper mapper;

    public IncidentSummaryDTO getIncidentSummary(LocalDate from, LocalDate to) {
        log.debug("Getting incident summary from {} to {}", from, to);

        long total = incidentRepository.count();
        long open = incidentRepository.countByStatus(IncidentStatus.OPEN);
        long inProgress = incidentRepository.countByStatus(IncidentStatus.IN_PROGRESS);
        long onHold = incidentRepository.countByStatus(IncidentStatus.ON_HOLD);
        long resolved = incidentRepository.countByStatus(IncidentStatus.RESOLVED);
        long closed = incidentRepository.countByStatus(IncidentStatus.CLOSED);
        long critical = incidentRepository.countByPriority(Priority.CRITICAL);
        Double avgResolution = incidentRepository.averageResolutionTime();
        Double avgAcknowledge = incidentRepository.averageTimeToAcknowledge();
        long slaBreaches = incidentRepository.countBySlaBreached(true);
        double slaCompliance = total > 0 ? ((double) (total - slaBreaches) / total) * 100 : 100.0;

        return new IncidentSummaryDTO(total, open, inProgress, onHold, resolved, closed,
                critical, avgResolution, avgAcknowledge, slaBreaches, slaCompliance);
    }

    public List<StatusCountDTO> getIncidentsByStatus() {
        log.debug("Getting incidents by status");
        return incidentRepository.countGroupByStatus().stream()
                .map(row -> new StatusCountDTO((IncidentStatus) row[0], (Long) row[1]))
                .toList();
    }

    public List<PriorityCountDTO> getIncidentsByPriority() {
        log.debug("Getting incidents by priority");
        return incidentRepository.countGroupByPriority().stream()
                .map(row -> new PriorityCountDTO((Priority) row[0], (Long) row[1]))
                .toList();
    }

    public List<CategoryCountDTO> getIncidentsByCategory() {
        log.debug("Getting incidents by category");
        return incidentRepository.countGroupByCategory().stream()
                .map(row -> new CategoryCountDTO((IncidentCategory) row[0], (Long) row[1]))
                .toList();
    }

    public List<OwnerCountDTO> getIncidentsByOwner(int limit) {
        log.debug("Getting incidents by owner, limit: {}", limit);
        List<Owner> owners = ownerRepository.findAll(PageRequest.of(0, limit)).getContent();

        return owners.stream()
                .map(owner -> {
                    long total = incidentRepository.countByOwnerId(owner.getId());
                    long openCount = incidentRepository.countByOwnerIdAndStatus(owner.getId(), IncidentStatus.OPEN);
                    long resolvedCount = incidentRepository.countByOwnerIdAndStatus(owner.getId(),
                            IncidentStatus.RESOLVED);
                    return new OwnerCountDTO(mapper.toOwnerSummary(owner), total, openCount, resolvedCount);
                })
                .sorted((a, b) -> Long.compare(b.totalIncidents(), a.totalIncidents()))
                .toList();
    }

    public ResolutionTimeStatsDTO getResolutionTimeStats(LocalDate from, LocalDate to, String groupBy) {
        log.debug("Getting resolution time stats from {} to {}, groupBy: {}", from, to, groupBy);

        List<Integer> resolutionTimes = incidentRepository.findAllResolutionTimes();
        if (resolutionTimes.isEmpty()) {
            return new ResolutionTimeStatsDTO(0.0, 0.0, 0, 0, 0.0, Collections.emptyList());
        }

        double avg = resolutionTimes.stream().mapToInt(Integer::intValue).average().orElse(0);
        int min = resolutionTimes.stream().mapToInt(Integer::intValue).min().orElse(0);
        int max = resolutionTimes.stream().mapToInt(Integer::intValue).max().orElse(0);

        double median;
        int size = resolutionTimes.size();
        if (size % 2 == 0) {
            median = (resolutionTimes.get(size / 2 - 1) + resolutionTimes.get(size / 2)) / 2.0;
        } else {
            median = resolutionTimes.get(size / 2);
        }

        int p90Index = (int) Math.ceil(size * 0.9) - 1;
        double p90 = p90Index >= 0 && p90Index < size ? resolutionTimes.get(p90Index) : 0;

        return new ResolutionTimeStatsDTO(avg, median, min, max, p90, Collections.emptyList());
    }

    public List<TrendDataDTO> getIncidentTrends(LocalDate from, LocalDate to, String groupBy) {
        log.debug("Getting incident trends from {} to {}, groupBy: {}", from, to, groupBy);

        LocalDateTime fromDate = from != null ? from.atStartOfDay() : LocalDate.now().minusMonths(3).atStartOfDay();
        LocalDateTime toDate = to != null ? to.atTime(23, 59, 59) : LocalDateTime.now();

        List<Incident> incidents = incidentRepository.findByCreatedAtBetween(fromDate, toDate);

        String effectiveGroupBy = groupBy != null ? groupBy : "week";

        Map<String, long[]> trendsMap = new TreeMap<>();

        for (Incident incident : incidents) {
            String period = getPeriodKey(incident.getCreatedAt(), effectiveGroupBy);
            trendsMap.computeIfAbsent(period, k -> new long[3]);
            trendsMap.get(period)[0]++; // created

            if (incident.getResolvedAt() != null) {
                String resolvedPeriod = getPeriodKey(incident.getResolvedAt(), effectiveGroupBy);
                trendsMap.computeIfAbsent(resolvedPeriod, k -> new long[3]);
                trendsMap.get(resolvedPeriod)[1]++; // resolved
            }

            if (incident.getClosedAt() != null) {
                String closedPeriod = getPeriodKey(incident.getClosedAt(), effectiveGroupBy);
                trendsMap.computeIfAbsent(closedPeriod, k -> new long[3]);
                trendsMap.get(closedPeriod)[2]++; // closed
            }
        }

        return trendsMap.entrySet().stream()
                .map(entry -> new TrendDataDTO(entry.getKey(), entry.getValue()[0], entry.getValue()[1],
                        entry.getValue()[2]))
                .toList();
    }

    private String getPeriodKey(LocalDateTime dateTime, String groupBy) {
        return switch (groupBy) {
            case "day" -> dateTime.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
            case "week" -> {
                int week = dateTime.get(ChronoField.ALIGNED_WEEK_OF_YEAR);
                yield "%d-W%02d".formatted(dateTime.getYear(), week);
            }
            case "month" -> "%d-%02d".formatted(dateTime.getYear(), dateTime.getMonthValue());
            default -> dateTime.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
        };
    }
}
