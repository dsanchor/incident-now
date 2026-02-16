import { IncidentStatus, Priority, IncidentCategory } from './enums';
import { OwnerSummary } from './owner.model';

export interface IncidentSummary {
    totalIncidents: number;
    openIncidents: number;
    inProgressIncidents: number;
    onHoldIncidents: number;
    resolvedIncidents: number;
    closedIncidents: number;
    criticalIncidents: number;
    averageResolutionTimeMinutes: number | null;
    averageTimeToAcknowledgeMinutes: number | null;
    slaBreachCount: number;
    slaCompliancePercentage: number | null;
}

export interface StatusCount {
    status: IncidentStatus;
    count: number;
}

export interface PriorityCount {
    priority: Priority;
    count: number;
}

export interface CategoryCount {
    category: IncidentCategory;
    count: number;
}

export interface OwnerCount {
    owner: OwnerSummary;
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
}
