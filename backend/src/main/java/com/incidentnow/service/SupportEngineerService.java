package com.incidentnow.service;

import com.incidentnow.config.DtoMapper;
import com.incidentnow.dto.*;
import com.incidentnow.entity.SupportEngineer;
import com.incidentnow.exception.DuplicateResourceException;
import com.incidentnow.exception.ResourceNotFoundException;
import com.incidentnow.model.IncidentCategory;
import com.incidentnow.repository.SupportEngineerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportEngineerService {

    private static final Logger log = LoggerFactory.getLogger(SupportEngineerService.class);

    private final SupportEngineerRepository supportEngineerRepository;
    private final DtoMapper mapper;

    @Transactional(readOnly = true)
    public PagedResponseDTO<SupportEngineerResponseDTO> listSupportEngineers(int page, int pageSize,
            Boolean active, String search) {
        log.debug("Listing support engineers - page: {}, size: {}, active: {}, search: {}",
                page, pageSize, active, search);
        Pageable pageable = PageRequest.of(page - 1, pageSize);
        Page<SupportEngineer> result = supportEngineerRepository.findWithFilters(active, search, pageable);

        return new PagedResponseDTO<>(
                result.getContent().stream().map(mapper::toSupportEngineerResponse).toList(),
                PaginationDTO.of(page, pageSize, result.getTotalElements()));
    }

    @Transactional(readOnly = true)
    public SupportEngineerResponseDTO getSupportEngineerById(UUID id) {
        log.debug("Getting support engineer by id: {}", id);
        SupportEngineer se = findOrThrow(id);
        return mapper.toSupportEngineerResponse(se);
    }

    @Transactional(readOnly = true)
    public List<SupportEngineerResponseDTO> findByCategory(IncidentCategory category) {
        log.debug("Finding support engineers by category: {}", category);
        return supportEngineerRepository.findByCategoryAndActive(category)
                .stream().map(mapper::toSupportEngineerResponse).toList();
    }

    @Transactional
    public SupportEngineerResponseDTO createSupportEngineer(SupportEngineerCreateDTO dto) {
        log.info("Creating support engineer with email: {}", dto.email());
        if (supportEngineerRepository.existsByEmail(dto.email())) {
            throw new DuplicateResourceException("Support engineer with email " + dto.email() + " already exists");
        }

        SupportEngineer se = SupportEngineer.builder()
                .name(dto.name())
                .email(dto.email())
                .phone(dto.phone())
                .avatarUrl(dto.avatarUrl())
                .timezone(dto.timezone())
                .slackHandle(dto.slackHandle())
                .githubUsername(dto.githubUsername())
                .onCall(dto.onCall() != null ? dto.onCall() : false)
                .workingHoursStart(dto.workingHoursStart())
                .workingHoursEnd(dto.workingHoursEnd())
                .categories(dto.categories() != null ? new ArrayList<>(dto.categories()) : new ArrayList<>())
                .active(true)
                .build();

        se = supportEngineerRepository.save(se);
        log.info("Support engineer created with id: {}", se.getId());
        return mapper.toSupportEngineerResponse(se);
    }

    @Transactional
    public SupportEngineerResponseDTO updateSupportEngineer(UUID id, SupportEngineerUpdateDTO dto) {
        log.info("Updating support engineer: {}", id);
        SupportEngineer se = findOrThrow(id);

        if (supportEngineerRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new DuplicateResourceException("Support engineer with email " + dto.email() + " already exists");
        }

        se.setName(dto.name());
        se.setEmail(dto.email());
        se.setPhone(dto.phone());
        se.setAvatarUrl(dto.avatarUrl());
        se.setTimezone(dto.timezone());
        se.setSlackHandle(dto.slackHandle());
        se.setGithubUsername(dto.githubUsername());
        if (dto.active() != null)
            se.setActive(dto.active());
        if (dto.onCall() != null)
            se.setOnCall(dto.onCall());
        se.setWorkingHoursStart(dto.workingHoursStart());
        se.setWorkingHoursEnd(dto.workingHoursEnd());
        if (dto.categories() != null)
            se.setCategories(new ArrayList<>(dto.categories()));

        se = supportEngineerRepository.save(se);
        log.info("Support engineer updated: {}", id);
        return mapper.toSupportEngineerResponse(se);
    }

    @Transactional
    public SupportEngineerResponseDTO patchSupportEngineer(UUID id, SupportEngineerPatchDTO dto) {
        log.info("Patching support engineer: {}", id);
        SupportEngineer se = findOrThrow(id);

        if (dto.email() != null && supportEngineerRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new DuplicateResourceException("Support engineer with email " + dto.email() + " already exists");
        }

        if (dto.name() != null)
            se.setName(dto.name());
        if (dto.email() != null)
            se.setEmail(dto.email());
        if (dto.phone() != null)
            se.setPhone(dto.phone());
        if (dto.avatarUrl() != null)
            se.setAvatarUrl(dto.avatarUrl());
        if (dto.timezone() != null)
            se.setTimezone(dto.timezone());
        if (dto.slackHandle() != null)
            se.setSlackHandle(dto.slackHandle());
        if (dto.githubUsername() != null)
            se.setGithubUsername(dto.githubUsername());
        if (dto.active() != null)
            se.setActive(dto.active());
        if (dto.onCall() != null)
            se.setOnCall(dto.onCall());
        if (dto.workingHoursStart() != null)
            se.setWorkingHoursStart(dto.workingHoursStart());
        if (dto.workingHoursEnd() != null)
            se.setWorkingHoursEnd(dto.workingHoursEnd());
        if (dto.categories() != null)
            se.setCategories(new ArrayList<>(dto.categories()));

        se = supportEngineerRepository.save(se);
        log.info("Support engineer patched: {}", id);
        return mapper.toSupportEngineerResponse(se);
    }

    @Transactional
    public void deleteSupportEngineer(UUID id) {
        log.info("Deleting support engineer: {}", id);
        SupportEngineer se = findOrThrow(id);
        se.setActive(false);
        supportEngineerRepository.save(se);
        log.info("Support engineer soft-deleted: {}", id);
    }

    public SupportEngineer findOrThrow(UUID id) {
        return supportEngineerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SupportEngineer", id));
    }
}
