package com.incidentnow.dto;

public record GitHubRepoInputDTO(
        String repoOwner,
        String repoName,
        String branch,
        Integer issueNumber,
        Integer pullRequestNumber,
        String commitSha) {
}
