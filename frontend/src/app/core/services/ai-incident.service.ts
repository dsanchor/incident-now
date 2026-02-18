import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { IncidentCreate, Priority, Severity, IncidentCategory } from '../models';

export interface AiIncidentRequest {
    description: string;
    ownerId: string;
}

@Injectable({ providedIn: 'root' })
export class AiIncidentService {
    /**
     * Processes a free-text incident description and returns a structured IncidentCreate.
     * Currently returns a mocked response. Will be replaced with a real AI backend call.
     */
    processDescription(request: AiIncidentRequest): Observable<IncidentCreate> {
        const description = request.description;

        // Mock AI analysis: extract a title from the first sentence
        const firstSentence = description.split(/[.!?\n]/)[0].trim();
        const title =
            firstSentence.length > 100
                ? firstSentence.substring(0, 97) + '...'
                : firstSentence || 'AI-generated incident';

        // Mock: derive priority/severity from keywords
        const lowerDesc = description.toLowerCase();
        let priority: Priority = 'medium';
        let severity: Severity = 'medium';
        let category: IncidentCategory = 'software';

        if (lowerDesc.includes('critical') || lowerDesc.includes('outage') || lowerDesc.includes('down')) {
            priority = 'critical';
            severity = 'critical';
        } else if (lowerDesc.includes('urgent') || lowerDesc.includes('major') || lowerDesc.includes('severe')) {
            priority = 'high';
            severity = 'high';
        } else if (lowerDesc.includes('minor') || lowerDesc.includes('cosmetic') || lowerDesc.includes('low')) {
            priority = 'low';
            severity = 'low';
        }

        if (lowerDesc.includes('network') || lowerDesc.includes('dns') || lowerDesc.includes('connectivity')) {
            category = 'network';
        } else if (lowerDesc.includes('database') || lowerDesc.includes('sql') || lowerDesc.includes('query')) {
            category = 'database';
        } else if (lowerDesc.includes('security') || lowerDesc.includes('breach') || lowerDesc.includes('vulnerability')) {
            category = 'security';
        } else if (lowerDesc.includes('hardware') || lowerDesc.includes('disk') || lowerDesc.includes('memory')) {
            category = 'hardware';
        } else if (lowerDesc.includes('cloud') || lowerDesc.includes('azure') || lowerDesc.includes('aws')) {
            category = 'cloud_infrastructure';
        } else if (lowerDesc.includes('performance') || lowerDesc.includes('slow') || lowerDesc.includes('latency')) {
            category = 'performance';
        } else if (lowerDesc.includes('permission') || lowerDesc.includes('access') || lowerDesc.includes('auth')) {
            category = 'access_permissions';
        } else if (lowerDesc.includes('application') || lowerDesc.includes('app') || lowerDesc.includes('ui')) {
            category = 'application';
        }

        // Extract potential tags from description
        const tagKeywords = ['api', 'database', 'auth', 'frontend', 'backend', 'deployment', 'monitoring', 'kubernetes', 'docker', 'ssl', 'dns', 'cache', 'storage'];
        const tags = tagKeywords.filter((kw) => lowerDesc.includes(kw));

        const mock: IncidentCreate = {
            title,
            description,
            priority,
            severity,
            category,
            ownerId: request.ownerId,
            tags: tags.length > 0 ? tags : undefined,
            affectedSystems: [],
            assigneeIds: [],
        };

        // Simulate a network delay (1-2s) to mimic AI processing
        return of(mock).pipe(delay(1500));
    }
}
