import { OwnerRole } from './enums';

export interface OwnerSummary {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    team: string;
    role: OwnerRole;
}

export interface Owner {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    team: string;
    role: OwnerRole;
    department: string | null;
    timezone: string | null;
    slackHandle: string | null;
    githubUsername: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OwnerCreate {
    name: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
    team: string;
    role: OwnerRole;
    department?: string;
    timezone?: string;
    slackHandle?: string;
    githubUsername?: string;
}

export interface OwnerUpdate {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    avatarUrl?: string;
    team: string;
    role: OwnerRole;
    department?: string;
    timezone?: string;
    slackHandle?: string;
    githubUsername?: string;
    active?: boolean;
}
