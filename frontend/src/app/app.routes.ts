import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: '',
        loadComponent: () =>
            import('./layouts/layout.component').then((m) => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent
                    ),
            },
            {
                path: 'incidents',
                loadComponent: () =>
                    import(
                        './features/incidents/incident-list/incident-list.component'
                    ).then((m) => m.IncidentListComponent),
            },
            {
                path: 'incidents/new',
                loadComponent: () =>
                    import(
                        './features/incidents/incident-form/incident-form.component'
                    ).then((m) => m.IncidentFormComponent),
            },
            {
                path: 'incidents/:id',
                loadComponent: () =>
                    import(
                        './features/incidents/incident-detail/incident-detail.component'
                    ).then((m) => m.IncidentDetailComponent),
            },
            {
                path: 'incidents/:id/edit',
                loadComponent: () =>
                    import(
                        './features/incidents/incident-form/incident-form.component'
                    ).then((m) => m.IncidentFormComponent),
            },
            {
                path: 'owners',
                loadComponent: () =>
                    import(
                        './features/owners/owner-list/owner-list.component'
                    ).then((m) => m.OwnerListComponent),
            },
            {
                path: 'support-engineers',
                loadComponent: () =>
                    import(
                        './features/support-engineers/support-engineer-list/support-engineer-list.component'
                    ).then((m) => m.SupportEngineerListComponent),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
