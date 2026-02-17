import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-icon-button (click)="toggleSidenav()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="logo" routerLink="/dashboard">
        <mat-icon class="logo-icon">bolt</mat-icon>
        <span class="logo-text">IncidentNow</span>
      </span>
      <span class="spacer"></span>
      <div class="user-info">
        @if (authService.currentOwner(); as owner) {
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span class="user-name">{{ owner.name }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <strong>{{ owner.name }}</strong>
              <small>{{ owner.email }}</small>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Sign Out</span>
            </button>
          </mat-menu>
        }
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        [mode]="'side'"
        [opened]="sidenavOpen()"
        class="sidenav"
      >
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/incidents" routerLinkActive="active-link">
            <mat-icon matListItemIcon>report_problem</mat-icon>
            <span matListItemTitle>Incidents</span>
          </a>
          <a mat-list-item routerLink="/owners" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Owners</span>
          </a>
          <a mat-list-item routerLink="/support-engineers" routerLinkActive="active-link">
            <mat-icon matListItemIcon>engineering</mat-icon>
            <span matListItemTitle>Support Engineers</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
    styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      margin-left: 8px;
    }

    .logo-icon {
      margin-right: 8px;
      font-size: 20px;
      width: 20px;
      height: 20px;
      background: #c62828;
      color: white;
      border-radius: 6px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .spacer {
      flex: 1;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 240px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }

    .main-content {
      padding: 24px;
      background: #fafafa;
      min-height: 100%;
    }

    .active-link {
      background: rgba(0, 0, 0, 0.04);
      font-weight: 500;
    }

    .user-info {
      display: flex;
      align-items: center;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 4px;
      color: inherit;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    .user-menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-menu-header small {
      color: rgba(0, 0, 0, 0.54);
      font-size: 12px;
    }
  `,
})
export class LayoutComponent {
    readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    readonly sidenavOpen = signal(true);

    toggleSidenav(): void {
        this.sidenavOpen.update((v) => !v);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
