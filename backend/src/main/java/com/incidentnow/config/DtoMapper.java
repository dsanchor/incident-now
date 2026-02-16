package com.incidentnow.config;

import com.incidentnow.dto.*;
import com.incidentnow.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class DtoMapper {

    // ===== Owner Mappings =====

    public OwnerResponseDTO toOwnerResponse(Owner owner) {
        return new OwnerResponseDTO(
                owner.getId(),
                owner.getName(),
                owner.getEmail(),
                owner.getPhone(),
                owner.getAvatarUrl(),
                owner.getTeam(),
                owner.getRole(),
                owner.getDepartment(),
                owner.getTimezone(),
                owner.getSlackHandle(),
                owner.getGithubUsername(),
                owner.isActive(),
                owner.isOnCall(),
                owner.getCreatedAt(),
                owner.getUpdatedAt());
    }

    public OwnerSummaryDTO toOwnerSummary(Owner owner) {
        if (owner == null)
            return null;
        return new OwnerSummaryDTO(
                owner.getId(),
                owner.getName(),
                owner.getEmail(),
                owner.getAvatarUrl(),
                owner.getTeam(),
                owner.getRole());
    }

    // ===== Incident Mappings =====

    public IncidentResponseDTO toIncidentResponse(Incident incident) {
        GitHubRepoDTO githubRepoDTO = null;
        if (incident.getGithubRepo() != null && !incident.getGithubRepo().isEmpty()) {
            GitHubRepo gh = incident.getGithubRepo();
            githubRepoDTO = new GitHubRepoDTO(
                    gh.getRepoOwner(),
                    gh.getRepoName(),
                    gh.getRepoUrl(),
                    gh.getBranch(),
                    gh.getIssueNumber(),
                    gh.getIssueUrl(),
                    gh.getPullRequestNumber(),
                    gh.getPullRequestUrl(),
                    gh.getCommitSha());
        }

        List<OwnerSummaryDTO> assignees = incident.getAssignees() != null
                ? incident.getAssignees().stream().map(this::toOwnerSummary).toList()
                : Collections.emptyList();

        return new IncidentResponseDTO(
                incident.getId(),
                incident.getIncidentNumber(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getStatus(),
                incident.getPriority(),
                incident.getSeverity(),
                incident.getCategory(),
                incident.getTags(),
                incident.getAffectedSystems(),
                incident.getAffectedUsers(),
                toOwnerSummary(incident.getOwner()),
                assignees,
                incident.getRootCause(),
                incident.getResolution(),
                incident.getWorkaround(),
                githubRepoDTO,
                incident.getDueDate(),
                incident.getCreatedAt(),
                incident.getUpdatedAt(),
                incident.getAcknowledgedAt(),
                incident.getResolvedAt(),
                incident.getClosedAt(),
                incident.isSlaBreached(),
                incident.getTimeToAcknowledge(),
                incident.getTimeToResolve());
    }

    public GitHubRepo toGitHubRepoEntity(GitHubRepoInputDTO dto) {
        if (dto == null)
            return null;
        return GitHubRepo.builder()
                .repoOwner(dto.repoOwner())
                .repoName(dto.repoName())
                .branch(dto.branch())
                .issueNumber(dto.issueNumber())
                .pullRequestNumber(dto.pullRequestNumber())
                .commitSha(dto.commitSha())
                .build();
    }

    // ===== Comment Mappings =====

    public CommentResponseDTO toCommentResponse(Comment comment) {
        return new CommentResponseDTO(
                comment.getId(),
                comment.getIncident().getId(),
                toOwnerSummary(comment.getAuthor()),
                comment.getContent(),
                comment.isInternal(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }

    // ===== Timeline Mappings =====

    public TimelineEventDTO toTimelineEventDTO(TimelineEvent event) {
        return new TimelineEventDTO(
                event.getId(),
                event.getIncident().getId(),
                event.getEventType(),
                event.getDescription(),
                event.getPreviousValue(),
                event.getNewValue(),
                toOwnerSummary(event.getActor()),
                event.getTimestamp());
    }
}
