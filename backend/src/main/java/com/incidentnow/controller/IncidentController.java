package com.incidentnow.controller;

import com.incidentnow.dto.*;
import com.incidentnow.model.*;
import com.incidentnow.service.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private static final Logger log = LoggerFactory.getLogger(IncidentController.class);

    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<IncidentResponseDTO>> listIncidents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) IncidentCategory category,
            @RequestParam(required = false) UUID ownerId,
            @RequestParam(required = false) UUID assigneeId,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) LocalDateTime createdAfter,
            @RequestParam(required = false) LocalDateTime createdBefore,
            @RequestParam(required = false) LocalDateTime resolvedAfter,
            @RequestParam(required = false) LocalDateTime resolvedBefore,
            @RequestParam(required = false) Boolean hasGithubRepo,
            @RequestParam(required = false) String search) {
        log.info("GET /incidents - page: {}, pageSize: {}, status: {}, priority: {}, search: {}",
                page, pageSize, status, priority, search);
        PagedResponseDTO<IncidentResponseDTO> response = incidentService.listIncidents(
                page, pageSize, sortBy, sortOrder, status, priority, severity,
                category, ownerId, assigneeId, tags, createdAfter, createdBefore,
                resolvedAfter, resolvedBefore, hasGithubRepo, search);
        log.info("GET /incidents - returned {} incidents", response.data().size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{incidentId}")
    public ResponseEntity<IncidentResponseDTO> getIncidentById(@PathVariable UUID incidentId) {
        log.info("GET /incidents/{}", incidentId);
        IncidentResponseDTO response = incidentService.getIncidentById(incidentId);
        log.info("GET /incidents/{} - found: {}", incidentId, response.incidentNumber());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<IncidentResponseDTO> createIncident(@Valid @RequestBody IncidentCreateDTO dto) {
        log.info("POST /incidents - title: {}", dto.title());
        IncidentResponseDTO response = incidentService.createIncident(dto);
        log.info("POST /incidents - created: {} ({})", response.id(), response.incidentNumber());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{incidentId}")
    public ResponseEntity<IncidentResponseDTO> updateIncident(
            @PathVariable UUID incidentId,
            @Valid @RequestBody IncidentUpdateDTO dto) {
        log.info("PUT /incidents/{}", incidentId);
        IncidentResponseDTO response = incidentService.updateIncident(incidentId, dto);
        log.info("PUT /incidents/{} - updated", incidentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{incidentId}")
    public ResponseEntity<IncidentResponseDTO> patchIncident(
            @PathVariable UUID incidentId,
            @Valid @RequestBody IncidentPatchDTO dto) {
        log.info("PATCH /incidents/{}", incidentId);
        IncidentResponseDTO response = incidentService.patchIncident(incidentId, dto);
        log.info("PATCH /incidents/{} - patched", incidentId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{incidentId}")
    public ResponseEntity<Void> deleteIncident(@PathVariable UUID incidentId) {
        log.info("DELETE /incidents/{}", incidentId);
        incidentService.deleteIncident(incidentId);
        log.info("DELETE /incidents/{} - deleted", incidentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{incidentId}/resolve")
    public ResponseEntity<IncidentResponseDTO> resolveIncident(
            @PathVariable UUID incidentId,
            @Valid @RequestBody IncidentResolutionDTO dto) {
        log.info("POST /incidents/{}/resolve", incidentId);
        IncidentResponseDTO response = incidentService.resolveIncident(incidentId, dto);
        log.info("POST /incidents/{}/resolve - resolved", incidentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{incidentId}/close")
    public ResponseEntity<IncidentResponseDTO> closeIncident(
            @PathVariable UUID incidentId,
            @RequestBody(required = false) Map<String, String> body) {
        log.info("POST /incidents/{}/close", incidentId);
        String closingNotes = body != null ? body.get("closingNotes") : null;
        IncidentResponseDTO response = incidentService.closeIncident(incidentId, closingNotes);
        log.info("POST /incidents/{}/close - closed", incidentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{incidentId}/reopen")
    public ResponseEntity<IncidentResponseDTO> reopenIncident(
            @PathVariable UUID incidentId,
            @RequestBody Map<String, String> body) {
        log.info("POST /incidents/{}/reopen", incidentId);
        String reason = body.get("reason");
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Reason is required to reopen an incident");
        }
        IncidentResponseDTO response = incidentService.reopenIncident(incidentId, reason);
        log.info("POST /incidents/{}/reopen - reopened", incidentId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{incidentId}/assign")
    public ResponseEntity<IncidentResponseDTO> assignIncident(
            @PathVariable UUID incidentId,
            @RequestBody Map<String, List<UUID>> body) {
        log.info("POST /incidents/{}/assign", incidentId);
        List<UUID> assigneeIds = body.get("assigneeIds");
        if (assigneeIds == null || assigneeIds.isEmpty()) {
            throw new IllegalArgumentException("At least one assignee ID is required");
        }
        IncidentResponseDTO response = incidentService.assignIncident(incidentId, assigneeIds);
        log.info("POST /incidents/{}/assign - assigned to {} users", incidentId, assigneeIds.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{incidentId}/comments")
    public ResponseEntity<PagedResponseDTO<CommentResponseDTO>> getIncidentComments(
            @PathVariable UUID incidentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        log.info("GET /incidents/{}/comments - page: {}", incidentId, page);
        PagedResponseDTO<CommentResponseDTO> response = incidentService.getIncidentComments(incidentId, page, pageSize);
        log.info("GET /incidents/{}/comments - returned {} comments", incidentId, response.data().size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{incidentId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable UUID incidentId,
            @Valid @RequestBody CommentCreateDTO dto) {
        log.info("POST /incidents/{}/comments", incidentId);
        CommentResponseDTO response = incidentService.addComment(incidentId, dto);
        log.info("POST /incidents/{}/comments - comment added: {}", incidentId, response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{incidentId}/timeline")
    public ResponseEntity<List<TimelineEventDTO>> getIncidentTimeline(@PathVariable UUID incidentId) {
        log.info("GET /incidents/{}/timeline", incidentId);
        List<TimelineEventDTO> timeline = incidentService.getIncidentTimeline(incidentId);
        log.info("GET /incidents/{}/timeline - returned {} events", incidentId, timeline.size());
        return ResponseEntity.ok(timeline);
    }
}
