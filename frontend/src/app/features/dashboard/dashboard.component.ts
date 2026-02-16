import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin } from 'rxjs';
import { StatisticsService } from '../../core/services/statistics.service';
import {
    IncidentSummary,
    StatusCount,
    PriorityCount,
    CategoryCount,
} from '../../core/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatDividerModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48" />
      </div>
    } @else {
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <div class="actions">
          <button mat-raised-button color="primary" routerLink="/incidents/new">
            <mat-icon>add</mat-icon> New Incident
          </button>
        </div>
      </div>

      @if (summary()) {
        <div class="stats-grid">
          <mat-card class="stat-card clickable" (click)="goToIncidents()">
            <mat-card-content>
              <div class="stat-icon total"><mat-icon>assignment</mat-icon></div>
              <div class="stat-value">{{ summary()!.totalIncidents }}</div>
              <div class="stat-label">Total Incidents</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card clickable" (click)="goToIncidents({ status: 'open' })">
            <mat-card-content>
              <div class="stat-icon open"><mat-icon>error_outline</mat-icon></div>
              <div class="stat-value">{{ summary()!.openIncidents }}</div>
              <div class="stat-label">Open</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card clickable" (click)="goToIncidents({ status: 'in_progress' })">
            <mat-card-content>
              <div class="stat-icon in-progress"><mat-icon>hourglass_empty</mat-icon></div>
              <div class="stat-value">{{ summary()!.inProgressIncidents }}</div>
              <div class="stat-label">In Progress</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card clickable" (click)="goToIncidents({ priority: 'critical' })">
            <mat-card-content>
              <div class="stat-icon critical"><mat-icon>warning</mat-icon></div>
              <div class="stat-value">{{ summary()!.criticalIncidents }}</div>
              <div class="stat-label">Critical</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card clickable" (click)="goToIncidents({ status: 'resolved' })">
            <mat-card-content>
              <div class="stat-icon resolved"><mat-icon>check_circle</mat-icon></div>
              <div class="stat-value">{{ summary()!.resolvedIncidents }}</div>
              <div class="stat-label">Resolved</div>
            </mat-card-content>
          </mat-card>
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon sla"><mat-icon>timer</mat-icon></div>
              <div class="stat-value">
                {{ summary()!.averageResolutionTimeMinutes != null
                  ? (summary()!.averageResolutionTimeMinutes! | number: '1.0-0') + 'm'
                  : 'N/A' }}
              </div>
              <div class="stat-label">Avg Resolution Time</div>
            </mat-card-content>
          </mat-card>
        </div>
      }

      <div class="breakdown-grid">
        @if (byStatus().length) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>By Status</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="breakdown-list">
                @for (item of byStatus(); track item.status) {
                  <div class="breakdown-row clickable" (click)="goToIncidents({ status: item.status })">
                    <span class="breakdown-label">{{ formatStatus(item.status) }}</span>
                    <span class="breakdown-count">{{ item.count }}</span>
                    <div class="breakdown-bar">
                      <div
                        class="breakdown-fill status-bg-{{ item.status }}"
                        [style.width.%]="getPercentage(item.count)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (byPriority().length) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>By Priority</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="breakdown-list">
                @for (item of byPriority(); track item.priority) {
                  <div class="breakdown-row clickable" (click)="goToIncidents({ priority: item.priority })">
                    <span class="breakdown-label">{{ formatPriority(item.priority) }}</span>
                    <span class="breakdown-count">{{ item.count }}</span>
                    <div class="breakdown-bar">
                      <div
                        class="breakdown-fill priority-bg-{{ item.priority }}"
                        [style.width.%]="getPercentage(item.count)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }

        @if (byCategory().length) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>By Category</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="breakdown-list">
                @for (item of byCategory(); track item.category) {
                  <div class="breakdown-row clickable" (click)="goToIncidents({ category: item.category })">
                    <span class="breakdown-label">{{ formatCategory(item.category) }}</span>
                    <span class="breakdown-count">{{ item.count }}</span>
                    <div class="breakdown-bar">
                      <div
                        class="breakdown-fill category-bg"
                        [style.width.%]="getPercentage(item.count)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
    styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 400;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .stat-icon mat-icon { color: white; }
    .stat-icon.total { background: #1976d2; }
    .stat-icon.open { background: #1565c0; }
    .stat-icon.in-progress { background: #e65100; }
    .stat-icon.critical { background: #c62828; }
    .stat-icon.resolved { background: #2e7d32; }
    .stat-icon.sla { background: #7b1fa2; }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      text-align: center;
    }

    .breakdown-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .breakdown-list {
      padding: 8px 0;
    }

    .breakdown-row {
      display: grid;
      grid-template-columns: 120px 40px 1fr;
      align-items: center;
      gap: 8px;
      padding: 6px 0;
    }

    .breakdown-label {
      font-size: 14px;
      text-transform: capitalize;
    }

    .breakdown-count {
      font-weight: 600;
      text-align: right;
    }

    .breakdown-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .breakdown-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .status-bg-open { background: #1565c0; }
    .status-bg-in_progress { background: #e65100; }
    .status-bg-on_hold { background: #7b1fa2; }
    .status-bg-resolved { background: #2e7d32; }
    .status-bg-closed { background: #5d4037; }

    .priority-bg-low { background: #4caf50; }
    .priority-bg-medium { background: #ffc107; }
    .priority-bg-high { background: #ff9800; }
    .priority-bg-critical { background: #f44336; }

    .category-bg { background: #1976d2; }

    .clickable {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .breakdown-row.clickable {
      border-radius: 6px;
      padding: 6px 8px;
      margin: 0 -8px;
    }

    .breakdown-row.clickable:hover {
      background: rgba(0, 0, 0, 0.04);
      transform: none;
      box-shadow: none;
    }
  `,
})
export class DashboardComponent implements OnInit {
    private readonly statsService = inject(StatisticsService);
    private readonly router = inject(Router);

    readonly loading = signal(true);
    readonly summary = signal<IncidentSummary | null>(null);
    readonly byStatus = signal<StatusCount[]>([]);
    readonly byPriority = signal<PriorityCount[]>([]);
    readonly byCategory = signal<CategoryCount[]>([]);

    private totalIncidents = 0;

    ngOnInit(): void {
        forkJoin({
            summary: this.statsService.getSummary(),
            byStatus: this.statsService.getByStatus(),
            byPriority: this.statsService.getByPriority(),
            byCategory: this.statsService.getByCategory(),
        }).subscribe({
            next: (result) => {
                this.summary.set(result.summary);
                this.byStatus.set(result.byStatus);
                this.byPriority.set(result.byPriority);
                this.byCategory.set(result.byCategory);
                this.totalIncidents = result.summary.totalIncidents || 1;
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    getPercentage(count: number): number {
        return this.totalIncidents > 0 ? (count / this.totalIncidents) * 100 : 0;
    }

    formatStatus(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatPriority(priority: string): string {
        return priority;
    }

    formatCategory(category: string): string {
        return category.replace(/_/g, ' ');
    }

    goToIncidents(queryParams?: Record<string, string>): void {
        this.router.navigate(['/incidents'], { queryParams });
    }
}
