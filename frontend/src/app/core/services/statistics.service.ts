import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    IncidentSummary,
    StatusCount,
    PriorityCount,
    CategoryCount,
    OwnerCount,
} from '../models';

@Injectable({ providedIn: 'root' })
export class StatisticsService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/statistics`;

    getSummary(): Observable<IncidentSummary> {
        return this.http.get<IncidentSummary>(`${this.baseUrl}/summary`);
    }

    getByStatus(): Observable<StatusCount[]> {
        return this.http.get<StatusCount[]>(`${this.baseUrl}/by-status`);
    }

    getByPriority(): Observable<PriorityCount[]> {
        return this.http.get<PriorityCount[]>(`${this.baseUrl}/by-priority`);
    }

    getByCategory(): Observable<CategoryCount[]> {
        return this.http.get<CategoryCount[]>(`${this.baseUrl}/by-category`);
    }

    getByOwner(limit = 10): Observable<OwnerCount[]> {
        return this.http.get<OwnerCount[]>(`${this.baseUrl}/by-owner?limit=${limit}`);
    }
}
