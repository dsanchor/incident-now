import { OwnerSummary } from './owner.model';
import { TimelineEventType } from './enums';

export interface Comment {
    id: string;
    incidentId: string;
    author: OwnerSummary;
    content: string;
    isInternal: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CommentCreate {
    content: string;
    isInternal?: boolean;
}

export interface TimelineEvent {
    id: string;
    incidentId: string;
    eventType: TimelineEventType;
    description: string;
    previousValue: string | null;
    newValue: string | null;
    actor: OwnerSummary;
    timestamp: string;
}
