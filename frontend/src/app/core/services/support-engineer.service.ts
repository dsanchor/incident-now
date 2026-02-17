import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    SupportEngineer,
    SupportEngineerCreate,
    SupportEngineerUpdate,
    PagedResponse,
    Incident,
    IncidentCategory,
} from '../models';

@Injectable({ providedIn: 'root' })
export class SupportEngineerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/support-engineers`;

    getSupportEngineers(params?: {
        page?: number;
        pageSize?: number;
        active?: boolean;
        search?: string;
    }): Observable<PagedResponse<SupportEngineer>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page != null) httpParams = httpParams.set('page', params.page);
            if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
            if (params.active != null) httpParams = httpParams.set('active', params.active);
            if (params.search) httpParams = httpParams.set('search', params.search);
        }
        return this.http.get<PagedResponse<SupportEngineer>>(this.baseUrl, { params: httpParams });
    }

    getSupportEngineer(id: string): Observable<SupportEngineer> {
        return this.http.get<SupportEngineer>(`${this.baseUrl}/${id}`);
    }

    getByCategory(category: IncidentCategory): Observable<SupportEngineer[]> {
        return this.http.get<SupportEngineer[]>(`${this.baseUrl}/by-category/${category}`);
    }

    createSupportEngineer(se: SupportEngineerCreate): Observable<SupportEngineer> {
        return this.http.post<SupportEngineer>(this.baseUrl, se);
    }

    updateSupportEngineer(id: string, se: SupportEngineerUpdate): Observable<SupportEngineer> {
        return this.http.put<SupportEngineer>(`${this.baseUrl}/${id}`, se);
    }

    patchSupportEngineer(
        id: string,
        patch: Partial<SupportEngineerUpdate>
    ): Observable<SupportEngineer> {
        return this.http.patch<SupportEngineer>(`${this.baseUrl}/${id}`, patch);
    }

    deleteSupportEngineer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    getAssignedIncidents(
        id: string,
        params?: { page?: number; pageSize?: number; status?: string }
    ): Observable<PagedResponse<Incident>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page != null) httpParams = httpParams.set('page', params.page);
            if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
            if (params.status) httpParams = httpParams.set('status', params.status);
        }
        return this.http.get<PagedResponse<Incident>>(`${this.baseUrl}/${id}/assigned-incidents`, {
            params: httpParams,
        });
    }
}
