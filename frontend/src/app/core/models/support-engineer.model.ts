import { IncidentCategory } from './enums';

export interface SupportEngineerSummary {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    onCall: boolean;
    categories: IncidentCategory[];
}

export interface SupportEngineer {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    timezone: string | null;
    slackHandle: string | null;
    githubUsername: string | null;
    active: boolean;
    onCall: boolean;
    workingHoursStart: string | null;
    workingHoursEnd: string | null;
    categories: IncidentCategory[];
    createdAt: string;
    updatedAt: string;
}

export interface SupportEngineerCreate {
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    timezone?: string;
    slackHandle?: string;
    githubUsername?: string;
    onCall?: boolean;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    categories?: IncidentCategory[];
}

export interface SupportEngineerUpdate extends SupportEngineerCreate {
    active?: boolean;
}
