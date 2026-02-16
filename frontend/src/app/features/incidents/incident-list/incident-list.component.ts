import {
    Component,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { IncidentService } from '../../../core/services/incident.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Incident, INCIDENT_STATUSES, PRIORITIES, CATEGORIES } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';
import { PriorityChipComponent } from '../../../shared/components/priority-chip.component';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../shared/components/confirm-dialog.component';

@Component({
    selector: 'app-incident-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatMenuModule,
        StatusChipComponent,
        PriorityChipComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="page-header">
      <h1>Incidents</h1>
      <button mat-raised-button color="primary" (click)="createIncident()">
        <mat-icon>add</mat-icon> New Incident
      </button>
    </div>

    <div class="filters-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search</mat-label>
        <input
          matInput
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearch($event)"
          placeholder="Search incidents..."
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Status</mat-label>
        <mat-select [ngModel]="statusFilter()" (ngModelChange)="onFilterChange('status', $event)">
          <mat-option value="">All</mat-option>
          @for (s of statuses; track s.value) {
            <mat-option [value]="s.value">{{ s.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Priority</mat-label>
        <mat-select
          [ngModel]="priorityFilter()"
          (ngModelChange)="onFilterChange('priority', $event)"
        >
          <mat-option value="">All</mat-option>
          @for (p of priorities; track p.value) {
            <mat-option [value]="p.value">{{ p.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" class="filter-field">
        <mat-label>Category</mat-label>
        <mat-select
          [ngModel]="categoryFilter()"
          (ngModelChange)="onFilterChange('category', $event)"
        >
          <mat-option value="">All</mat-option>
          @for (c of categories; track c.value) {
            <mat-option [value]="c.value">{{ c.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48" />
      </div>
    } @else {
      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="incidents()">
          <ng-container matColumnDef="incidentNumber">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let inc">
              <span class="incident-number">{{ inc.incidentNumber }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Title</th>
            <td mat-cell *matCellDef="let inc">
              <div class="incident-title" (click)="viewIncident(inc)" matTooltip="{{ inc.title }}">
                {{ inc.title }}
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let inc">
              <app-status-chip [status]="inc.status" />
            </td>
          </ng-container>

          <ng-container matColumnDef="priority">
            <th mat-header-cell *matHeaderCellDef>Priority</th>
            <td mat-cell *matCellDef="let inc">
              <app-priority-chip [priority]="inc.priority" />
            </td>
          </ng-container>

          <ng-container matColumnDef="owner">
            <th mat-header-cell *matHeaderCellDef>Owner</th>
            <td mat-cell *matCellDef="let inc">
              {{ inc.owner?.name || '—' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="createdAt">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let inc">
              {{ inc.createdAt | date: 'short' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let inc">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewIncident(inc)">
                  <mat-icon>visibility</mat-icon> View
                </button>
                <button mat-menu-item (click)="editIncident(inc)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="confirmDelete(inc)">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" class="clickable-row"></tr>
        </table>

        @if (incidents().length === 0) {
          <div class="empty-state">
            <mat-icon>report_off</mat-icon>
            <p>No incidents found</p>
          </div>
        }

        <mat-paginator
          [length]="totalItems()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
          showFirstLastButtons
        />
      </div>
    }
  `,
    styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 400;
    }

    .filters-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .search-field {
      flex: 1;
      min-width: 200px;
    }

    .filter-field {
      min-width: 140px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .table-container {
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    table { width: 100%; }

    .incident-number {
      font-family: monospace;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
    }

    .incident-title {
      cursor: pointer;
      font-weight: 500;
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .incident-title:hover {
      color: #1976d2;
      text-decoration: underline;
    }

    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.02);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: rgba(0, 0, 0, 0.38);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  `,
})
export class IncidentListComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly incidentService = inject(IncidentService);
    private readonly notification = inject(NotificationService);
    private readonly router = inject(Router);
    private readonly dialog = inject(MatDialog);

    readonly displayedColumns = [
        'incidentNumber',
        'title',
        'status',
        'priority',
        'owner',
        'createdAt',
        'actions',
    ];
    readonly statuses = INCIDENT_STATUSES;
    readonly priorities = PRIORITIES;
    readonly categories = CATEGORIES;

    readonly loading = signal(true);
    readonly incidents = signal<Incident[]>([]);
    readonly totalItems = signal(0);
    readonly pageSize = signal(10);
    readonly currentPage = signal(1);
    readonly searchQuery = signal('');
    readonly statusFilter = signal('');
    readonly priorityFilter = signal('');
    readonly categoryFilter = signal('');

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        const params = this.route.snapshot.queryParams;
        if (params['status']) this.statusFilter.set(params['status']);
        if (params['priority']) this.priorityFilter.set(params['priority']);
        if (params['category']) this.categoryFilter.set(params['category']);
        if (params['search']) this.searchQuery.set(params['search']);
        this.loadIncidents();
    }

    loadIncidents(): void {
        this.loading.set(true);
        this.incidentService
            .getIncidents({
                page: this.currentPage(),
                pageSize: this.pageSize(),
                search: this.searchQuery() || undefined,
                status: this.statusFilter() || undefined,
                priority: this.priorityFilter() || undefined,
                category: this.categoryFilter() || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc',
            })
            .subscribe({
                next: (response) => {
                    this.incidents.set(response.data);
                    this.totalItems.set(response.pagination.totalItems);
                    this.loading.set(false);
                },
                error: () => {
                    this.notification.error('Failed to load incidents');
                    this.loading.set(false);
                },
            });
    }

    onSearch(query: string): void {
        this.searchQuery.set(query);
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentPage.set(1);
            this.loadIncidents();
        }, 300);
    }

    onFilterChange(filter: string, value: string): void {
        if (filter === 'status') this.statusFilter.set(value);
        if (filter === 'priority') this.priorityFilter.set(value);
        if (filter === 'category') this.categoryFilter.set(value);
        this.currentPage.set(1);
        this.loadIncidents();
    }

    onPage(event: PageEvent): void {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadIncidents();
    }

    viewIncident(incident: Incident): void {
        this.router.navigate(['/incidents', incident.id]);
    }

    createIncident(): void {
        this.router.navigate(['/incidents', 'new']);
    }

    editIncident(incident: Incident): void {
        this.router.navigate(['/incidents', incident.id, 'edit']);
    }

    confirmDelete(incident: Incident): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Incident',
                message: `Delete "${incident.incidentNumber}: ${incident.title}"? This cannot be undone.`,
                confirmText: 'Delete',
                color: 'warn',
            } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.incidentService.deleteIncident(incident.id).subscribe({
                    next: () => {
                        this.notification.success('Incident deleted');
                        this.loadIncidents();
                    },
                    error: () => this.notification.error('Failed to delete incident'),
                });
            }
        });
    }
}
