import { IncidentStatus, Priority, Severity, IncidentCategory } from './enums';
import { OwnerSummary } from './owner.model';
import { SupportEngineerSummary } from './support-engineer.model';

export interface GitHubRepo {
    repoOwner: string;
    repoName: string;
    repoUrl: string | null;
    branch: string | null;
    issueNumber: number | null;
    issueUrl: string | null;
    pullRequestNumber: number | null;
    pullRequestUrl: string | null;
    commitSha: string | null;
}

export interface GitHubRepoInput {
    repoOwner: string;
    repoName: string;
    branch?: string;
    issueNumber?: number;
    pullRequestNumber?: number;
    commitSha?: string;
}

export interface Incident {
    id: string;
    incidentNumber: string;
    title: string;
    description: string;
    status: IncidentStatus;
    priority: Priority;
    severity: Severity;
    category: IncidentCategory;
    tags: string[];
    affectedSystems: string[];
    affectedUsers: number | null;
    owner: OwnerSummary;
    assignees: SupportEngineerSummary[];
    rootCause: string | null;
    resolution: string | null;
    workaround: string | null;
    githubRepo: GitHubRepo | null;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
    acknowledgedAt: string | null;
    resolvedAt: string | null;
    closedAt: string | null;
    slaBreached: boolean;
    timeToAcknowledge: number | null;
    timeToResolve: number | null;
}

export interface IncidentCreate {
    title: string;
    description: string;
    priority: Priority;
    severity: Severity;
    category: IncidentCategory;
    tags?: string[];
    affectedSystems?: string[];
    affectedUsers?: number;
    ownerId?: string;
    assigneeIds?: string[];
    workaround?: string;
    githubRepo?: GitHubRepoInput;
    dueDate?: string;
}

export interface IncidentUpdate {
    title: string;
    description: string;
    status?: IncidentStatus;
    priority: Priority;
    severity: Severity;
    category: IncidentCategory;
    tags?: string[];
    affectedSystems?: string[];
    affectedUsers?: number;
    ownerId?: string;
    assigneeIds?: string[];
    rootCause?: string;
    resolution?: string;
    workaround?: string;
    githubRepo?: GitHubRepoInput;
    dueDate?: string;
}

export interface IncidentResolution {
    rootCause?: string;
    resolution: string;
}
