package com.incidentnow.controller;

import com.incidentnow.dto.*;
import com.incidentnow.model.OwnerRole;
import com.incidentnow.model.IncidentStatus;
import com.incidentnow.service.IncidentService;
import com.incidentnow.service.OwnerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/owners")
@RequiredArgsConstructor
public class OwnerController {

    private static final Logger log = LoggerFactory.getLogger(OwnerController.class);

    private final OwnerService ownerService;
    private final IncidentService incidentService;

    @GetMapping
    public ResponseEntity<PagedResponseDTO<OwnerResponseDTO>> listOwners(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) OwnerRole role,
            @RequestParam(required = false) String search) {
        log.info("GET /owners - page: {}, pageSize: {}, active: {}, team: {}, role: {}, search: {}",
                page, pageSize, active, team, role, search);
        PagedResponseDTO<OwnerResponseDTO> response = ownerService.listOwners(page, pageSize, active, team, role,
                search);
        log.info("GET /owners - returned {} owners", response.data().size());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<OwnerResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        log.info("POST /owners/login - email: {}", dto.email());
        OwnerResponseDTO response = ownerService.login(dto.email(), dto.password());
        if (response == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<OwnerResponseDTO> getOwnerById(@PathVariable UUID ownerId) {
        log.info("GET /owners/{}", ownerId);
        OwnerResponseDTO response = ownerService.getOwnerById(ownerId);
        log.info("GET /owners/{} - found owner: {}", ownerId, response.name());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<OwnerResponseDTO> createOwner(@Valid @RequestBody OwnerCreateDTO dto) {
        log.info("POST /owners - name: {}, email: {}", dto.name(), dto.email());
        OwnerResponseDTO response = ownerService.createOwner(dto);
        log.info("POST /owners - created owner: {}", response.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{ownerId}")
    public ResponseEntity<OwnerResponseDTO> updateOwner(
            @PathVariable UUID ownerId,
            @Valid @RequestBody OwnerUpdateDTO dto) {
        log.info("PUT /owners/{}", ownerId);
        OwnerResponseDTO response = ownerService.updateOwner(ownerId, dto);
        log.info("PUT /owners/{} - updated", ownerId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{ownerId}")
    public ResponseEntity<OwnerResponseDTO> patchOwner(
            @PathVariable UUID ownerId,
            @Valid @RequestBody OwnerPatchDTO dto) {
        log.info("PATCH /owners/{}", ownerId);
        OwnerResponseDTO response = ownerService.patchOwner(ownerId, dto);
        log.info("PATCH /owners/{} - patched", ownerId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{ownerId}")
    public ResponseEntity<Void> deleteOwner(@PathVariable UUID ownerId) {
        log.info("DELETE /owners/{}", ownerId);
        ownerService.deleteOwner(ownerId);
        log.info("DELETE /owners/{} - deleted", ownerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ownerId}/incidents")
    public ResponseEntity<PagedResponseDTO<IncidentResponseDTO>> getOwnerIncidents(
            @PathVariable UUID ownerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) IncidentStatus status) {
        log.info("GET /owners/{}/incidents - page: {}, status: {}", ownerId, page, status);
        PagedResponseDTO<IncidentResponseDTO> response = incidentService.getOwnerIncidents(ownerId, page, pageSize,
                status);
        log.info("GET /owners/{}/incidents - returned {} incidents", ownerId, response.data().size());
        return ResponseEntity.ok(response);
    }
}
