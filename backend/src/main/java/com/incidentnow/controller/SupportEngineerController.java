package com.incidentnow.controller;

import com.incidentnow.dto.*;
import com.incidentnow.model.IncidentCategory;
import com.incidentnow.model.IncidentStatus;
import com.incidentnow.service.IncidentService;
import com.incidentnow.service.SupportEngineerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/support-engineers")
@RequiredArgsConstructor
public class SupportEngineerController {

    private static final Logger log = LoggerFactory.getLogger(SupportEngineerController.class);

    private final SupportEngineerService supportEngineerService;
    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<SupportEngineerResponseDTO>> listSupportEngineers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String search) {
        log.info("GET /support-engineers - page: {}, pageSize: {}, active: {}, search: {}",
                page, pageSize, active, search);
        PagedResponseDTO<SupportEngineerResponseDTO> response = supportEngineerService.listSupportEngineers(page,
                pageSize, active, search);
        log.info("GET /support-engineers - returned {} support engineers", response.data().size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportEngineerResponseDTO> getSupportEngineerById(@PathVariable UUID id) {
        log.info("GET /support-engineers/{}", id);
        SupportEngineerResponseDTO response = supportEngineerService.getSupportEngineerById(id);
        log.info("GET /support-engineers/{} - found: {}", id, response.name());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-category/{category}")
    public ResponseEntity<List<SupportEngineerResponseDTO>> getSupportEngineersByCategory(
            @PathVariable IncidentCategory category) {
        log.info("GET /support-engineers/by-category/{}", category);
        List<SupportEngineerResponseDTO> response = supportEngineerService.findByCategory(category);
        log.info("GET /support-engineers/by-category/{} - returned {}", category, response.size());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<SupportEngineerResponseDTO> createSupportEngineer(
            @Valid @RequestBody SupportEngineerCreateDTO dto) {
        log.info("POST /support-engineers - name: {}, email: {}", dto.name(), dto.email());
        SupportEngineerResponseDTO response = supportEngineerService.createSupportEngineer(dto);
        log.info("POST /support-engineers - created: {}", response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupportEngineerResponseDTO> updateSupportEngineer(
            @PathVariable UUID id,
            @Valid @RequestBody SupportEngineerUpdateDTO dto) {
        log.info("PUT /support-engineers/{}", id);
        SupportEngineerResponseDTO response = supportEngineerService.updateSupportEngineer(id, dto);
        log.info("PUT /support-engineers/{} - updated", id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SupportEngineerResponseDTO> patchSupportEngineer(
            @PathVariable UUID id,
            @Valid @RequestBody SupportEngineerPatchDTO dto) {
        log.info("PATCH /support-engineers/{}", id);
        SupportEngineerResponseDTO response = supportEngineerService.patchSupportEngineer(id, dto);
        log.info("PATCH /support-engineers/{} - patched", id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupportEngineer(@PathVariable UUID id) {
        log.info("DELETE /support-engineers/{}", id);
        supportEngineerService.deleteSupportEngineer(id);
        log.info("DELETE /support-engineers/{} - deleted", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/assigned-incidents")
    public ResponseEntity<PagedResponseDTO<IncidentResponseDTO>> getAssignedIncidents(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) IncidentStatus status) {
        log.info("GET /support-engineers/{}/assigned-incidents - page: {}, status: {}", id, page, status);
        PagedResponseDTO<IncidentResponseDTO> response = incidentService.getSupportEngineerAssignedIncidents(id, page,
                pageSize, status);
        log.info("GET /support-engineers/{}/assigned-incidents - returned {}", id, response.data().size());
        return ResponseEntity.ok(response);
    }
}
