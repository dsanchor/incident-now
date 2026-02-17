import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Owner, OwnerCreate, OwnerUpdate, PagedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class OwnerService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/owners`;

    getOwners(params?: {
        page?: number;
        pageSize?: number;
        active?: boolean;
        team?: string;
        role?: string;
        search?: string;
    }): Observable<PagedResponse<Owner>> {
        let httpParams = new HttpParams();
        if (params) {
            if (params.page != null) httpParams = httpParams.set('page', params.page);
            if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);
            if (params.active != null) httpParams = httpParams.set('active', params.active);
            if (params.team) httpParams = httpParams.set('team', params.team);
            if (params.role) httpParams = httpParams.set('role', params.role);
            if (params.search) httpParams = httpParams.set('search', params.search);
        }
        return this.http.get<PagedResponse<Owner>>(this.baseUrl, { params: httpParams });
    }

    getOwner(id: string): Observable<Owner> {
        return this.http.get<Owner>(`${this.baseUrl}/${id}`);
    }

    createOwner(owner: OwnerCreate): Observable<Owner> {
        return this.http.post<Owner>(this.baseUrl, owner);
    }

    updateOwner(id: string, owner: OwnerUpdate): Observable<Owner> {
        return this.http.put<Owner>(`${this.baseUrl}/${id}`, owner);
    }

    patchOwner(id: string, patch: Partial<OwnerUpdate>): Observable<Owner> {
        return this.http.patch<Owner>(`${this.baseUrl}/${id}`, patch);
    }

    deleteOwner(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
