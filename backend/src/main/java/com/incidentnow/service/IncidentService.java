package com.incidentnow.service;

import com.incidentnow.config.DtoMapper;
import com.incidentnow.dto.*;
import com.incidentnow.entity.*;
import com.incidentnow.exception.ConflictException;
import com.incidentnow.exception.ResourceNotFoundException;
import com.incidentnow.model.*;
import com.incidentnow.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final OwnerRepository ownerRepository;
    private final CommentRepository commentRepository;
    private final TimelineEventRepository timelineEventRepository;
    private final DtoMapper mapper;

    private final AtomicLong sequenceCounter = new AtomicLong(0);

    @jakarta.annotation.PostConstruct
    public void initSequence() {
        String maxNumber = incidentRepository.findMaxIncidentNumber();
        if (maxNumber != null) {
            try {
                String[] parts = maxNumber.split("-");
                sequenceCounter.set(Long.parseLong(parts[parts.length - 1]));
            } catch (Exception e) {
                log.warn("Could not parse max incident number: {}", maxNumber);
            }
        }
    }

    private String generateIncidentNumber() {
        long seq = sequenceCounter.incrementAndGet();
        return "INC-%d-%04d".formatted(Year.now().getValue(), seq);
    }

    // ===== CRUD =====

    @Transactional(readOnly = true)
    public PagedResponseDTO<IncidentResponseDTO> listIncidents(
            int page, int pageSize, String sortBy, String sortOrder,
            IncidentStatus status, Priority priority, Severity severity,
            IncidentCategory category, UUID ownerId, UUID assigneeId,
            String tags, LocalDateTime createdAfter, LocalDateTime createdBefore,
            LocalDateTime resolvedAfter, LocalDateTime resolvedBefore,
            Boolean hasGithubRepo, String search) {

        log.debug("Listing incidents - page: {}, size: {}, sortBy: {}, status: {}", page, pageSize, sortBy, status);

        Sort sort = Sort.by(Sort.Direction.fromString(sortOrder != null ? sortOrder : "desc"),
                sortBy != null ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page - 1, pageSize, sort);

        Page<Incident> result = incidentRepository.findWithFilters(
                status, priority, severity, category, ownerId,
                createdAfter, createdBefore, resolvedAfter, resolvedBefore,
                search, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toIncidentResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public IncidentResponseDTO getIncidentById(UUID incidentId) {
        log.debug("Getting incident by id: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO createIncident(IncidentCreateDTO dto) {
        log.info("Creating incident: {}", dto.title());
        Owner owner = ownerRepository.findById(dto.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner", dto.ownerId()));

        Set<Owner> assignees = new HashSet<>();
        if (dto.assigneeIds() != null) {
            for (UUID assigneeId : dto.assigneeIds()) {
                assignees.add(ownerRepository.findById(assigneeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee", assigneeId)));
            }
        }

        Incident incident = Incident.builder()
                .incidentNumber(generateIncidentNumber())
                .title(dto.title())
                .description(dto.description())
                .status(IncidentStatus.OPEN)
                .priority(dto.priority())
                .severity(dto.severity())
                .category(dto.category())
                .tags(dto.tags() != null ? new ArrayList<>(dto.tags()) : new ArrayList<>())
                .affectedSystems(
                        dto.affectedSystems() != null ? new ArrayList<>(dto.affectedSystems()) : new ArrayList<>())
                .affectedUsers(dto.affectedUsers())
                .owner(owner)
                .assignees(assignees)
                .workaround(dto.workaround())
                .githubRepo(mapper.toGitHubRepoEntity(dto.githubRepo()))
                .dueDate(dto.dueDate())
                .build();

        incident = incidentRepository.save(incident);

        createTimelineEvent(incident, TimelineEventType.CREATED,
                "Incident created: " + incident.getIncidentNumber(), null, null, owner);

        log.info("Incident created: {} ({})", incident.getId(), incident.getIncidentNumber());
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO updateIncident(UUID incidentId, IncidentUpdateDTO dto) {
        log.info("Updating incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);
        Owner owner = ownerRepository.findById(dto.ownerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner", dto.ownerId()));

        Set<Owner> assignees = new HashSet<>();
        if (dto.assigneeIds() != null) {
            for (UUID assigneeId : dto.assigneeIds()) {
                assignees.add(ownerRepository.findById(assigneeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee", assigneeId)));
            }
        }

        // Track changes for timeline
        if (dto.status() != null && dto.status() != incident.getStatus()) {
            createTimelineEvent(incident, TimelineEventType.STATUS_CHANGED,
                    "Status changed", incident.getStatus().getValue(), dto.status().getValue(), owner);
        }
        if (dto.priority() != incident.getPriority()) {
            createTimelineEvent(incident, TimelineEventType.PRIORITY_CHANGED,
                    "Priority changed", incident.getPriority().getValue(), dto.priority().getValue(), owner);
        }

        incident.setTitle(dto.title());
        incident.setDescription(dto.description());
        if (dto.status() != null)
            incident.setStatus(dto.status());
        incident.setPriority(dto.priority());
        incident.setSeverity(dto.severity());
        incident.setCategory(dto.category());
        incident.setTags(dto.tags() != null ? new ArrayList<>(dto.tags()) : new ArrayList<>());
        incident.setAffectedSystems(
                dto.affectedSystems() != null ? new ArrayList<>(dto.affectedSystems()) : new ArrayList<>());
        incident.setAffectedUsers(dto.affectedUsers());
        incident.setOwner(owner);
        incident.setAssignees(assignees);
        incident.setRootCause(dto.rootCause());
        incident.setResolution(dto.resolution());
        incident.setWorkaround(dto.workaround());
        incident.setGithubRepo(mapper.toGitHubRepoEntity(dto.githubRepo()));
        incident.setDueDate(dto.dueDate());

        incident = incidentRepository.save(incident);
        log.info("Incident updated: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO patchIncident(UUID incidentId, IncidentPatchDTO dto) {
        log.info("Patching incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);
        Owner actor = incident.getOwner();

        if (dto.title() != null)
            incident.setTitle(dto.title());
        if (dto.description() != null)
            incident.setDescription(dto.description());
        if (dto.status() != null && dto.status() != incident.getStatus()) {
            createTimelineEvent(incident, TimelineEventType.STATUS_CHANGED,
                    "Status changed", incident.getStatus().getValue(), dto.status().getValue(), actor);
            incident.setStatus(dto.status());
        }
        if (dto.priority() != null && dto.priority() != incident.getPriority()) {
            createTimelineEvent(incident, TimelineEventType.PRIORITY_CHANGED,
                    "Priority changed", incident.getPriority().getValue(), dto.priority().getValue(), actor);
            incident.setPriority(dto.priority());
        }
        if (dto.severity() != null && dto.severity() != incident.getSeverity()) {
            createTimelineEvent(incident, TimelineEventType.SEVERITY_CHANGED,
                    "Severity changed", incident.getSeverity().getValue(), dto.severity().getValue(), actor);
            incident.setSeverity(dto.severity());
        }
        if (dto.category() != null)
            incident.setCategory(dto.category());
        if (dto.tags() != null)
            incident.setTags(new ArrayList<>(dto.tags()));
        if (dto.affectedSystems() != null)
            incident.setAffectedSystems(new ArrayList<>(dto.affectedSystems()));
        if (dto.affectedUsers() != null)
            incident.setAffectedUsers(dto.affectedUsers());
        if (dto.ownerId() != null) {
            Owner newOwner = ownerRepository.findById(dto.ownerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Owner", dto.ownerId()));
            if (!incident.getOwner().getId().equals(newOwner.getId())) {
                createTimelineEvent(incident, TimelineEventType.OWNER_CHANGED,
                        "Owner changed", incident.getOwner().getName(), newOwner.getName(), actor);
                incident.setOwner(newOwner);
            }
        }
        if (dto.assigneeIds() != null) {
            Set<Owner> assignees = new HashSet<>();
            for (UUID assigneeId : dto.assigneeIds()) {
                assignees.add(ownerRepository.findById(assigneeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Assignee", assigneeId)));
            }
            incident.setAssignees(assignees);
        }
        if (dto.rootCause() != null)
            incident.setRootCause(dto.rootCause());
        if (dto.resolution() != null)
            incident.setResolution(dto.resolution());
        if (dto.workaround() != null)
            incident.setWorkaround(dto.workaround());
        if (dto.githubRepo() != null) {
            incident.setGithubRepo(mapper.toGitHubRepoEntity(dto.githubRepo()));
            createTimelineEvent(incident, TimelineEventType.GITHUB_UPDATED,
                    "GitHub repository information updated", null, null, actor);
        }
        if (dto.dueDate() != null)
            incident.setDueDate(dto.dueDate());

        incident = incidentRepository.save(incident);
        log.info("Incident patched: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public void deleteIncident(UUID incidentId) {
        log.info("Deleting incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);

        // Delete related data
        timelineEventRepository.findByIncidentIdOrderByTimestampAsc(incidentId)
                .forEach(timelineEventRepository::delete);
        commentRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId, Pageable.unpaged())
                .forEach(commentRepository::delete);

        incidentRepository.delete(incident);
        log.info("Incident deleted: {}", incidentId);
    }

    // ===== Actions =====

    @Transactional
    public IncidentResponseDTO resolveIncident(UUID incidentId, IncidentResolutionDTO dto) {
        log.info("Resolving incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);

        if (incident.getStatus() == IncidentStatus.RESOLVED || incident.getStatus() == IncidentStatus.CLOSED) {
            throw new ConflictException("Incident is already " + incident.getStatus().getValue());
        }

        String previousStatus = incident.getStatus().getValue();
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setRootCause(dto.rootCause());
        incident.setResolution(dto.resolution());
        incident.setResolvedAt(LocalDateTime.now());

        if (incident.getCreatedAt() != null) {
            long minutes = java.time.Duration.between(incident.getCreatedAt(), incident.getResolvedAt()).toMinutes();
            incident.setTimeToResolve((int) minutes);
        }

        createTimelineEvent(incident, TimelineEventType.RESOLVED,
                "Incident resolved", previousStatus, "resolved", incident.getOwner());

        incident = incidentRepository.save(incident);
        log.info("Incident resolved: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO closeIncident(UUID incidentId, String closingNotes) {
        log.info("Closing incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);

        if (incident.getStatus() != IncidentStatus.RESOLVED) {
            throw new ConflictException(
                    "Incident must be resolved before closing. Current status: " + incident.getStatus().getValue());
        }

        String previousStatus = incident.getStatus().getValue();
        incident.setStatus(IncidentStatus.CLOSED);
        incident.setClosedAt(LocalDateTime.now());

        createTimelineEvent(incident, TimelineEventType.CLOSED,
                closingNotes != null ? "Incident closed: " + closingNotes : "Incident closed",
                previousStatus, "closed", incident.getOwner());

        incident = incidentRepository.save(incident);
        log.info("Incident closed: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO reopenIncident(UUID incidentId, String reason) {
        log.info("Reopening incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);

        if (incident.getStatus() != IncidentStatus.RESOLVED && incident.getStatus() != IncidentStatus.CLOSED) {
            throw new ConflictException("Incident can only be reopened from resolved or closed status. Current status: "
                    + incident.getStatus().getValue());
        }

        String previousStatus = incident.getStatus().getValue();
        incident.setStatus(IncidentStatus.OPEN);
        incident.setResolvedAt(null);
        incident.setClosedAt(null);
        incident.setTimeToResolve(null);

        createTimelineEvent(incident, TimelineEventType.REOPENED,
                "Incident reopened: " + reason, previousStatus, "open", incident.getOwner());

        incident = incidentRepository.save(incident);
        log.info("Incident reopened: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    @Transactional
    public IncidentResponseDTO assignIncident(UUID incidentId, List<UUID> assigneeIds) {
        log.info("Assigning incident: {} to {} users", incidentId, assigneeIds.size());
        Incident incident = findIncidentOrThrow(incidentId);

        Set<Owner> assignees = new HashSet<>();
        for (UUID assigneeId : assigneeIds) {
            Owner assignee = ownerRepository.findById(assigneeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee", assigneeId));
            assignees.add(assignee);
        }

        incident.setAssignees(assignees);

        if (incident.getStatus() == IncidentStatus.OPEN) {
            incident.setStatus(IncidentStatus.IN_PROGRESS);
            incident.setAcknowledgedAt(LocalDateTime.now());
            if (incident.getCreatedAt() != null) {
                long minutes = java.time.Duration.between(incident.getCreatedAt(), incident.getAcknowledgedAt())
                        .toMinutes();
                incident.setTimeToAcknowledge((int) minutes);
            }
        }

        String assigneeNames = assignees.stream().map(Owner::getName).reduce((a, b) -> a + ", " + b).orElse("");
        createTimelineEvent(incident, TimelineEventType.ASSIGNED,
                "Assigned to: " + assigneeNames, null, assigneeNames, incident.getOwner());

        incident = incidentRepository.save(incident);
        log.info("Incident assigned: {}", incidentId);
        return mapper.toIncidentResponse(incident);
    }

    // ===== Comments =====

    @Transactional(readOnly = true)
    public PagedResponseDTO<CommentResponseDTO> getIncidentComments(UUID incidentId, int page, int pageSize) {
        log.debug("Getting comments for incident: {}", incidentId);
        findIncidentOrThrow(incidentId);

        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<Comment> result = commentRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toCommentResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    @Transactional
    public CommentResponseDTO addComment(UUID incidentId, CommentCreateDTO dto) {
        log.info("Adding comment to incident: {}", incidentId);
        Incident incident = findIncidentOrThrow(incidentId);

        // Use incident owner as default author
        Comment comment = Comment.builder()
                .incident(incident)
                .author(incident.getOwner())
                .content(dto.content())
                .isInternal(dto.isInternal() != null ? dto.isInternal() : false)
                .build();

        comment = commentRepository.save(comment);

        createTimelineEvent(incident, TimelineEventType.COMMENT_ADDED,
                "Comment added", null, null, incident.getOwner());

        log.info("Comment added to incident: {}", incidentId);
        return mapper.toCommentResponse(comment);
    }

    // ===== Timeline =====

    @Transactional(readOnly = true)
    public List<TimelineEventDTO> getIncidentTimeline(UUID incidentId) {
        log.debug("Getting timeline for incident: {}", incidentId);
        findIncidentOrThrow(incidentId);

        return timelineEventRepository.findByIncidentIdOrderByTimestampAsc(incidentId)
                .stream()
                .map(mapper::toTimelineEventDTO)
                .toList();
    }

    // ===== Owner Incidents =====

    @Transactional(readOnly = true)
    public PagedResponseDTO<IncidentResponseDTO> getOwnerIncidents(UUID ownerId, int page, int pageSize,
            IncidentStatus status) {
        log.debug("Getting incidents for owner: {}", ownerId);
        ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner", ownerId));

        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Incident> result = status != null
                ? incidentRepository.findByOwnerIdAndStatus(ownerId, status, pageable)
                : incidentRepository.findByOwnerId(ownerId, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toIncidentResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public PagedResponseDTO<IncidentResponseDTO> getOwnerAssignedIncidents(UUID ownerId, int page, int pageSize,
            IncidentStatus status) {
        log.debug("Getting assigned incidents for owner: {}", ownerId);
        ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner", ownerId));

        Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Incident> result = status != null
                ? incidentRepository.findByAssigneeIdAndStatus(ownerId, status, pageable)
                : incidentRepository.findByAssigneeId(ownerId, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toIncidentResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    // ===== Helpers =====

    private Incident findIncidentOrThrow(UUID incidentId) {
        return incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", incidentId));
    }

    private void createTimelineEvent(Incident incident, TimelineEventType eventType,
            String description, String previousValue,
            String newValue, Owner actor) {
        TimelineEvent event = TimelineEvent.builder()
                .incident(incident)
                .eventType(eventType)
                .description(description)
                .previousValue(previousValue)
                .newValue(newValue)
                .actor(actor)
                .timestamp(LocalDateTime.now())
                .build();
        timelineEventRepository.save(event);
    }
}
