package com.incidentnow.dto;

public record GitHubRepoDTO(
        String repoOwner,
        String repoName,
        String repoUrl,
        String branch,
        Integer issueNumber,
        String issueUrl,
        Integer pullRequestNumber,
        String pullRequestUrl,
        String commitSha) {
}
