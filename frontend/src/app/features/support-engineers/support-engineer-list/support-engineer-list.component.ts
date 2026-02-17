import {
    Component,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { SupportEngineerService } from '../../../core/services/support-engineer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SupportEngineer } from '../../../core/models';
import { SupportEngineerFormDialogComponent } from '../support-engineer-form/support-engineer-form-dialog.component';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../shared/components/confirm-dialog.component';

@Component({
    selector: 'app-support-engineer-list',
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
        MatChipsModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        MatMenuModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="page-header">
      <h1>Support Engineers</h1>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>person_add</mat-icon> Add Support Engineer
      </button>
    </div>

    <div class="search-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search support engineers</mat-label>
        <input
          matInput
          [ngModel]="searchQuery()"
          (ngModelChange)="onSearch($event)"
          placeholder="Search by name or email..."
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48" />
      </div>
    } @else {
      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="engineers()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let se">
              <div class="se-name-cell">
                <div class="avatar">{{ getInitials(se.name) }}</div>
                <div>
                  <div class="se-name">{{ se.name }}</div>
                  <div class="se-email">{{ se.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="categories">
            <th mat-header-cell *matHeaderCellDef>Categories</th>
            <td mat-cell *matCellDef="let se">
              <div class="categories">
                @for (cat of se.categories; track cat) {
                  <span class="category-pill">{{ formatEnum(cat) }}</span>
                }
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let se">
              <mat-chip [class]="se.active ? 'active-chip' : 'inactive-chip'" highlighted>
                {{ se.active ? 'Active' : 'Inactive' }}
              </mat-chip>
              @if (se.onCall) {
                <mat-chip class="oncall-chip" highlighted>On Call</mat-chip>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="workingHours">
            <th mat-header-cell *matHeaderCellDef>Working Hours</th>
            <td mat-cell *matCellDef="let se">
              @if (se.workingHoursStart && se.workingHoursEnd) {
                {{ se.workingHoursStart }} - {{ se.workingHoursEnd }}
              } @else {
                <span class="muted">Not set</span>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let se">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openEditDialog(se)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="toggleActive(se)">
                  <mat-icon>{{ se.active ? 'person_off' : 'person' }}</mat-icon>
                  {{ se.active ? 'Deactivate' : 'Activate' }}
                </button>
                <button mat-menu-item (click)="toggleOnCall(se)">
                  <mat-icon>{{ se.onCall ? 'phone_disabled' : 'phone_in_talk' }}</mat-icon>
                  {{ se.onCall ? 'Remove On Call' : 'Set On Call' }}
                </button>
                <button mat-menu-item (click)="confirmDelete(se)" class="delete-action">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        @if (engineers().length === 0) {
          <div class="empty-state">
            <mat-icon>engineering</mat-icon>
            <p>No support engineers found</p>
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

    .search-bar {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
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

    table {
      width: 100%;
    }

    .se-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #7b1fa2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      flex-shrink: 0;
    }

    .se-name {
      font-weight: 500;
    }

    .se-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }


    .categories {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .category-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      background: #e3f2fd;
      color: #1565c0;
      text-transform: capitalize;
    }

    .active-chip {
      --mdc-chip-elevated-container-color: #e8f5e9;
      --mdc-chip-label-text-color: #2e7d32;
      font-size: 12px;
    }

    .inactive-chip {
      --mdc-chip-elevated-container-color: #ffebee;
      --mdc-chip-label-text-color: #c62828;
      font-size: 12px;
    }

    .oncall-chip {
      --mdc-chip-elevated-container-color: #fff3e0;
      --mdc-chip-label-text-color: #e65100;
      font-size: 12px;
      margin-left: 4px;
    }

    .muted {
      color: rgba(0, 0, 0, 0.38);
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

    .delete-action {
      color: #c62828;
    }
  `,
})
export class SupportEngineerListComponent implements OnInit {
    private readonly seService = inject(SupportEngineerService);
    private readonly dialog = inject(MatDialog);
    private readonly notification = inject(NotificationService);

    readonly displayedColumns = [
        'name',
        'categories',
        'status',
        'workingHours',
        'actions',
    ];
    readonly loading = signal(true);
    readonly engineers = signal<SupportEngineer[]>([]);
    readonly totalItems = signal(0);
    readonly pageSize = signal(10);
    readonly currentPage = signal(1);
    readonly searchQuery = signal('');

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        this.loadEngineers();
    }

    loadEngineers(): void {
        this.loading.set(true);
        this.seService
            .getSupportEngineers({
                page: this.currentPage(),
                pageSize: this.pageSize(),
                search: this.searchQuery() || undefined,
            })
            .subscribe({
                next: (response) => {
                    this.engineers.set(response.data);
                    this.totalItems.set(response.pagination.totalItems);
                    this.loading.set(false);
                },
                error: () => {
                    this.notification.error('Failed to load support engineers');
                    this.loading.set(false);
                },
            });
    }

    onSearch(query: string): void {
        this.searchQuery.set(query);
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentPage.set(1);
            this.loadEngineers();
        }, 300);
    }

    onPage(event: PageEvent): void {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadEngineers();
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(SupportEngineerFormDialogComponent, {
            width: '620px',
            data: { engineer: null },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.loadEngineers();
        });
    }

    openEditDialog(se: SupportEngineer): void {
        const dialogRef = this.dialog.open(SupportEngineerFormDialogComponent, {
            width: '620px',
            data: { engineer: se },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.loadEngineers();
        });
    }

    toggleActive(se: SupportEngineer): void {
        this.seService.patchSupportEngineer(se.id, { active: !se.active }).subscribe({
            next: () => {
                this.notification.success(
                    `${se.name} ${se.active ? 'deactivated' : 'activated'}`
                );
                this.loadEngineers();
            },
            error: () => this.notification.error('Failed to update status'),
        });
    }

    toggleOnCall(se: SupportEngineer): void {
        this.seService.patchSupportEngineer(se.id, { onCall: !se.onCall }).subscribe({
            next: () => {
                this.notification.success(
                    `${se.name} ${se.onCall ? 'removed from' : 'set to'} on call`
                );
                this.loadEngineers();
            },
            error: () => this.notification.error('Failed to update on-call status'),
        });
    }

    confirmDelete(se: SupportEngineer): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Support Engineer',
                message: `Are you sure you want to delete "${se.name}"? This action cannot be undone.`,
                confirmText: 'Delete',
                color: 'warn',
            } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.seService.deleteSupportEngineer(se.id).subscribe({
                    next: () => {
                        this.notification.success(`${se.name} deleted`);
                        this.loadEngineers();
                    },
                    error: () => this.notification.error('Failed to delete support engineer'),
                });
            }
        });
    }

    getInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatEnum(value: string): string {
        return value?.replace(/_/g, ' ') || '';
    }
}
