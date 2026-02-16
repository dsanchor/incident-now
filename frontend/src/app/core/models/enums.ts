export type IncidentStatus = 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentCategory =
    | 'network'
    | 'hardware'
    | 'software'
    | 'security'
    | 'database'
    | 'cloud_infrastructure'
    | 'application'
    | 'performance'
    | 'access_permissions'
    | 'other';
export type OwnerRole = 'engineer' | 'senior_engineer' | 'team_lead' | 'manager' | 'admin';
export type TimelineEventType =
    | 'created'
    | 'status_changed'
    | 'priority_changed'
    | 'severity_changed'
    | 'assigned'
    | 'unassigned'
    | 'owner_changed'
    | 'comment_added'
    | 'resolved'
    | 'closed'
    | 'reopened'
    | 'github_linked'
    | 'github_updated'
    | 'sla_breached';

export const INCIDENT_STATUSES: { value: IncidentStatus; label: string }[] = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

export const PRIORITIES: { value: Priority; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

export const SEVERITIES: { value: Severity; label: string }[] = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

export const CATEGORIES: { value: IncidentCategory; label: string }[] = [
    { value: 'network', label: 'Network' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'security', label: 'Security' },
    { value: 'database', label: 'Database' },
    { value: 'cloud_infrastructure', label: 'Cloud Infrastructure' },
    { value: 'application', label: 'Application' },
    { value: 'performance', label: 'Performance' },
    { value: 'access_permissions', label: 'Access & Permissions' },
    { value: 'other', label: 'Other' },
];

export const OWNER_ROLES: { value: OwnerRole; label: string }[] = [
    { value: 'engineer', label: 'Engineer' },
    { value: 'senior_engineer', label: 'Senior Engineer' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
];
