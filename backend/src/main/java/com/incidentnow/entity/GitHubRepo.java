package com.incidentnow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GitHubRepo {

    @Column(name = "github_repo_owner")
    private String repoOwner;

    @Column(name = "github_repo_name")
    private String repoName;

    @Column(name = "github_branch")
    private String branch;

    @Column(name = "github_issue_number")
    private Integer issueNumber;

    @Column(name = "github_pr_number")
    private Integer pullRequestNumber;

    @Column(name = "github_commit_sha")
    private String commitSha;

    public String getRepoUrl() {
        if (repoOwner != null && repoName != null) {
            return "https://github.com/" + repoOwner + "/" + repoName;
        }
        return null;
    }

    public String getIssueUrl() {
        if (repoOwner != null && repoName != null && issueNumber != null) {
            return "https://github.com/" + repoOwner + "/" + repoName + "/issues/" + issueNumber;
        }
        return null;
    }

    public String getPullRequestUrl() {
        if (repoOwner != null && repoName != null && pullRequestNumber != null) {
            return "https://github.com/" + repoOwner + "/" + repoName + "/pull/" + pullRequestNumber;
        }
        return null;
    }

    public boolean isEmpty() {
        return repoOwner == null && repoName == null && branch == null
                && issueNumber == null && pullRequestNumber == null && commitSha == null;
    }
}
