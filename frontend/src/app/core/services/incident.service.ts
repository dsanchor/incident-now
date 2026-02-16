import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Incident,
    IncidentCreate,
    IncidentUpdate,
    IncidentResolution,
    PagedResponse,
    Comment,
    CommentCreate,
    TimelineEvent,
} from '../models';

@Injectable({ providedIn: 'root' })
export class IncidentService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/incidents`;

    getIncidents(params?: {
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortOrder?: string;
        status?: string;
        priority?: string;
        severity?: string;
        category?: string;
        search?: string;
        ownerId?: string;
    }): Observable<PagedResponse<Incident>> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value != null && value !== '') {
                    httpParams = httpParams.set(key, value);
                }
            });
        }
        return this.http.get<PagedResponse<Incident>>(this.baseUrl, { params: httpParams });
    }

    getIncident(id: string): Observable<Incident> {
        return this.http.get<Incident>(`${this.baseUrl}/${id}`);
    }

    createIncident(incident: IncidentCreate): Observable<Incident> {
        return this.http.post<Incident>(this.baseUrl, incident);
    }

    updateIncident(id: string, incident: IncidentUpdate): Observable<Incident> {
        return this.http.put<Incident>(`${this.baseUrl}/${id}`, incident);
    }

    patchIncident(id: string, patch: Partial<IncidentUpdate>): Observable<Incident> {
        return this.http.patch<Incident>(`${this.baseUrl}/${id}`, patch);
    }

    deleteIncident(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    resolveIncident(id: string, resolution: IncidentResolution): Observable<Incident> {
        return this.http.post<Incident>(`${this.baseUrl}/${id}/resolve`, resolution);
    }

    closeIncident(id: string, closingNotes?: string): Observable<Incident> {
        return this.http.post<Incident>(`${this.baseUrl}/${id}/close`, { closingNotes });
    }

    reopenIncident(id: string, reason: string): Observable<Incident> {
        return this.http.post<Incident>(`${this.baseUrl}/${id}/reopen`, { reason });
    }

    assignIncident(id: string, assigneeIds: string[]): Observable<Incident> {
        return this.http.post<Incident>(`${this.baseUrl}/${id}/assign`, { assigneeIds });
    }

    getComments(
        incidentId: string,
        params?: { page?: number; pageSize?: number }
    ): Observable<PagedResponse<Comment>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page != null) httpParams = httpParams.set('page', params.page);
            if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
        }
        return this.http.get<PagedResponse<Comment>>(`${this.baseUrl}/${incidentId}/comments`, {
            params: httpParams,
        });
    }

    addComment(incidentId: string, comment: CommentCreate): Observable<Comment> {
        return this.http.post<Comment>(`${this.baseUrl}/${incidentId}/comments`, comment);
    }

    getTimeline(incidentId: string): Observable<TimelineEvent[]> {
        return this.http.get<TimelineEvent[]>(`${this.baseUrl}/${incidentId}/timeline`);
    }
}
