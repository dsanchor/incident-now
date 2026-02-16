import { Component, ChangeDetectionStrategy, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Owner } from '../../../core/models';

export interface AssignDialogData {
    owners: Owner[];
    currentAssignees: string[];
}

@Component({
    selector: 'app-assign-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2 mat-dialog-title>Assign Incident</h2>
    <mat-dialog-content>
      <p class="hint">Select one or more assignees:</p>
      <mat-selection-list #assigneeList [(ngModel)]="selectedIds">
        @for (owner of data.owners; track owner.id) {
          <mat-list-option [value]="owner.id">
            <mat-icon matListItemIcon>person</mat-icon>
            <span matListItemTitle>{{ owner.name }}</span>
            <span matListItemLine>{{ owner.team }} &middot; {{ owner.role }}</span>
          </mat-list-option>
        }
      </mat-selection-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="submit()">
        Assign ({{ selectedIds.length }})
      </button>
    </mat-dialog-actions>
  `,
    styles: `
    .hint {
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 8px;
      font-size: 14px;
    }
    mat-dialog-content {
      min-height: 200px;
      max-height: 400px;
    }
  `,
})
export class AssignDialogComponent {
    selectedIds: string[];

    constructor(
        private dialogRef: MatDialogRef<AssignDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AssignDialogData
    ) {
        this.selectedIds = [...data.currentAssignees];
    }

    submit(): void {
        this.dialogRef.close(this.selectedIds);
    }
}
