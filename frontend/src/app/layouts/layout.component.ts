import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
  `,
})
export class LayoutComponent {
    readonly sidenavOpen = signal(true);

    toggleSidenav(): void {
        this.sidenavOpen.update((v) => !v);
    }
}
