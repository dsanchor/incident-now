import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Owner } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiBaseUrl}/owners`;

    private readonly _currentOwner = signal<Owner | null>(null);

    readonly currentOwner = this._currentOwner.asReadonly();

    readonly isLoggedIn = computed(() => !!this._currentOwner());

    constructor() {
        const stored = localStorage.getItem('currentOwner');
        if (stored) {
            try {
                this._currentOwner.set(JSON.parse(stored));
            } catch {
                localStorage.removeItem('currentOwner');
            }
        }
    }

    login(email: string, password: string): Observable<Owner | null> {
        return this.http
            .post<Owner>(`${this.baseUrl}/login`, { email, password })
            .pipe(
                tap((owner) => {
                    this._currentOwner.set(owner);
                    localStorage.setItem('currentOwner', JSON.stringify(owner));
                }),
                catchError(() => of(null))
            );
    }

    logout(): void {
        this._currentOwner.set(null);
        localStorage.removeItem('currentOwner');
    }
}
