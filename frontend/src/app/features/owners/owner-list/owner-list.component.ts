import {
    Component,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    signal,
    computed,
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
import { OwnerService } from '../../../core/services/owner.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Owner } from '../../../core/models';
import { OwnerFormDialogComponent } from '../owner-form/owner-form-dialog.component';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../shared/components/confirm-dialog.component';

@Component({
    selector: 'app-owner-list',
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
      <h1>Owners</h1>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>person_add</mat-icon> Add Owner
      </button>
    </div>

    <div class="search-bar">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search owners</mat-label>
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
        <table mat-table [dataSource]="owners()">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Name</th>
            <td mat-cell *matCellDef="let owner">
              <div class="owner-name-cell">
                <div class="avatar">{{ getInitials(owner.name) }}</div>
                <div>
                  <div class="owner-name">{{ owner.name }}</div>
                  <div class="owner-email">{{ owner.email }}</div>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="team">
            <th mat-header-cell *matHeaderCellDef>Team</th>
            <td mat-cell *matCellDef="let owner">{{ owner.team }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let owner">
              <span class="role-badge">{{ formatRole(owner.role) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let owner">
              <mat-chip [class]="owner.active ? 'active-chip' : 'inactive-chip'" highlighted>
                {{ owner.active ? 'Active' : 'Inactive' }}
              </mat-chip>
              @if (owner.onCall) {
                <mat-chip class="oncall-chip" highlighted>On Call</mat-chip>
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let owner">
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="Actions">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openEditDialog(owner)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="toggleActive(owner)">
                  <mat-icon>{{ owner.active ? 'person_off' : 'person' }}</mat-icon>
                  {{ owner.active ? 'Deactivate' : 'Activate' }}
                </button>
                <button mat-menu-item (click)="confirmDelete(owner)" class="delete-action">
                  <mat-icon>delete</mat-icon> Delete
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        @if (owners().length === 0) {
          <div class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <p>No owners found</p>
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

    .owner-name-cell {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 0;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
      flex-shrink: 0;
    }

    .owner-name {
      font-weight: 500;
    }

    .owner-email {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }

    .role-badge {
      text-transform: capitalize;
      font-size: 13px;
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
export class OwnerListComponent implements OnInit {
    private readonly ownerService = inject(OwnerService);
    private readonly dialog = inject(MatDialog);
    private readonly notification = inject(NotificationService);

    readonly displayedColumns = ['name', 'team', 'role', 'status', 'actions'];
    readonly loading = signal(true);
    readonly owners = signal<Owner[]>([]);
    readonly totalItems = signal(0);
    readonly pageSize = signal(10);
    readonly currentPage = signal(1);
    readonly searchQuery = signal('');

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;

    ngOnInit(): void {
        this.loadOwners();
    }

    loadOwners(): void {
        this.loading.set(true);
        this.ownerService
            .getOwners({
                page: this.currentPage(),
                pageSize: this.pageSize(),
                search: this.searchQuery() || undefined,
            })
            .subscribe({
                next: (response) => {
                    this.owners.set(response.data);
                    this.totalItems.set(response.pagination.totalItems);
                    this.loading.set(false);
                },
                error: () => {
                    this.notification.error('Failed to load owners');
                    this.loading.set(false);
                },
            });
    }

    onSearch(query: string): void {
        this.searchQuery.set(query);
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.currentPage.set(1);
            this.loadOwners();
        }, 300);
    }

    onPage(event: PageEvent): void {
        this.currentPage.set(event.pageIndex + 1);
        this.pageSize.set(event.pageSize);
        this.loadOwners();
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(OwnerFormDialogComponent, {
            width: '560px',
            data: { owner: null },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.loadOwners();
        });
    }

    openEditDialog(owner: Owner): void {
        const dialogRef = this.dialog.open(OwnerFormDialogComponent, {
            width: '560px',
            data: { owner },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) this.loadOwners();
        });
    }

    toggleActive(owner: Owner): void {
        this.ownerService.patchOwner(owner.id, { active: !owner.active }).subscribe({
            next: () => {
                this.notification.success(
                    `${owner.name} ${owner.active ? 'deactivated' : 'activated'}`
                );
                this.loadOwners();
            },
            error: () => this.notification.error('Failed to update owner status'),
        });
    }

    confirmDelete(owner: Owner): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Delete Owner',
                message: `Are you sure you want to delete "${owner.name}"? This action cannot be undone.`,
                confirmText: 'Delete',
                color: 'warn',
            } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.ownerService.deleteOwner(owner.id).subscribe({
                    next: () => {
                        this.notification.success(`${owner.name} deleted`);
                        this.loadOwners();
                    },
                    error: () => this.notification.error('Failed to delete owner'),
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

    formatRole(role: string): string {
        return role.replace(/_/g, ' ');
    }
}
