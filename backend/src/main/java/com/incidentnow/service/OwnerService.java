package com.incidentnow.service;

import com.incidentnow.config.DtoMapper;
import com.incidentnow.dto.*;
import com.incidentnow.entity.Owner;
import com.incidentnow.exception.DuplicateResourceException;
import com.incidentnow.exception.ConflictException;
import com.incidentnow.exception.ResourceNotFoundException;
import com.incidentnow.model.OwnerRole;
import com.incidentnow.repository.IncidentRepository;
import com.incidentnow.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OwnerService {

    private static final Logger log = LoggerFactory.getLogger(OwnerService.class);

    private final OwnerRepository ownerRepository;
    private final IncidentRepository incidentRepository;
    private final DtoMapper mapper;

    @Transactional(readOnly = true)
    public PagedResponseDTO<OwnerResponseDTO> listOwners(int page, int pageSize,
            Boolean active, String team,
            OwnerRole role, String search) {
        log.debug("Listing owners - page: {}, size: {}, active: {}, team: {}, role: {}, search: {}",
                page, pageSize, active, team, role, search);
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<Owner> result = ownerRepository.findWithFilters(active, team, role, search, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toOwnerResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public OwnerResponseDTO getOwnerById(UUID ownerId) {
        log.debug("Getting owner by id: {}", ownerId);
        Owner owner = findOwnerOrThrow(ownerId);
        return mapper.toOwnerResponse(owner);
    }

    @Transactional
    public OwnerResponseDTO createOwner(OwnerCreateDTO dto) {
        log.info("Creating owner with email: {}", dto.email());
        if (ownerRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Owner with email " + dto.email() + " already exists");
        }

        Owner owner = Owner.builder()
                .name(dto.name())
                .email(dto.email())
                .password(dto.password())
                .phone(dto.phone())
                .avatarUrl(dto.avatarUrl())
                .team(dto.team())
                .role(dto.role())
                .department(dto.department())
                .timezone(dto.timezone())
                .slackHandle(dto.slackHandle())
                .githubUsername(dto.githubUsername())
                .active(true)
                .build();

        owner = ownerRepository.save(owner);
        log.info("Owner created with id: {}", owner.getId());
        return mapper.toOwnerResponse(owner);
    }

    @Transactional
    public OwnerResponseDTO updateOwner(UUID ownerId, OwnerUpdateDTO dto) {
        log.info("Updating owner: {}", ownerId);
        Owner owner = findOwnerOrThrow(ownerId);

        if (ownerRepository.existsByEmailAndIdNot(dto.email(), ownerId)) {
            throw new DuplicateResourceException("Owner with email " + dto.email() + " already exists");
        }

        owner.setName(dto.name());
        owner.setEmail(dto.email());
        if (dto.password() != null && !dto.password().isBlank()) {
            owner.setPassword(dto.password());
        }
        owner.setPhone(dto.phone());
        owner.setAvatarUrl(dto.avatarUrl());
        owner.setTeam(dto.team());
        owner.setRole(dto.role());
        owner.setDepartment(dto.department());
        owner.setTimezone(dto.timezone());
        owner.setSlackHandle(dto.slackHandle());
        owner.setGithubUsername(dto.githubUsername());
        if (dto.active() != null)
            owner.setActive(dto.active());

        owner = ownerRepository.save(owner);
        log.info("Owner updated: {}", ownerId);
        return mapper.toOwnerResponse(owner);
    }

    @Transactional
    public OwnerResponseDTO patchOwner(UUID ownerId, OwnerPatchDTO dto) {
        log.info("Patching owner: {}", ownerId);
        Owner owner = findOwnerOrThrow(ownerId);

        if (dto.email() != null && ownerRepository.existsByEmailAndIdNot(dto.email(), ownerId)) {
            throw new DuplicateResourceException("Owner with email " + dto.email() + " already exists");
        }

        if (dto.name() != null)
            owner.setName(dto.name());
        if (dto.email() != null)
            owner.setEmail(dto.email());
        if (dto.password() != null && !dto.password().isBlank())
            owner.setPassword(dto.password());
        if (dto.phone() != null)
            owner.setPhone(dto.phone());
        if (dto.avatarUrl() != null)
            owner.setAvatarUrl(dto.avatarUrl());
        if (dto.team() != null)
            owner.setTeam(dto.team());
        if (dto.role() != null)
            owner.setRole(dto.role());
        if (dto.department() != null)
            owner.setDepartment(dto.department());
        if (dto.timezone() != null)
            owner.setTimezone(dto.timezone());
        if (dto.slackHandle() != null)
            owner.setSlackHandle(dto.slackHandle());
        if (dto.githubUsername() != null)
            owner.setGithubUsername(dto.githubUsername());
        if (dto.active() != null)
            owner.setActive(dto.active());

        owner = ownerRepository.save(owner);
        log.info("Owner patched: {}", ownerId);
        return mapper.toOwnerResponse(owner);
    }

    @Transactional
    public void deleteOwner(UUID ownerId) {
        log.info("Deleting owner: {}", ownerId);
        Owner owner = findOwnerOrThrow(ownerId);

        long activeIncidents = incidentRepository.countActiveByOwnerId(ownerId);
        if (activeIncidents > 0) {
            throw new ConflictException("Cannot delete owner with " + activeIncidents + " active incidents");
        }

        owner.setActive(false);
        ownerRepository.save(owner);
        log.info("Owner soft-deleted: {}", ownerId);
    }

    public Owner findOwnerOrThrow(UUID ownerId) {
        return ownerRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner", ownerId));
    }

    @Transactional(readOnly = true)
    public OwnerResponseDTO login(String email, String password) {
        log.info("Login attempt for email: {}", email);
        Owner owner = ownerRepository.findByEmail(email)
                .orElse(null);
        if (owner == null || !owner.getPassword().equals(password)) {
            return null;
        }
        if (!owner.isActive()) {
            return null;
        }
        log.info("Login successful for owner: {}", owner.getId());
        return mapper.toOwnerResponse(owner);
    }
}
