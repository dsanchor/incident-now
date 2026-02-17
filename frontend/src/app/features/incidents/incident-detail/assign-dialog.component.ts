import { Component, ChangeDetectionStrategy, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule, MatSelectionList } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SupportEngineer } from '../../../core/models';

export interface AssignDialogData {
    supportEngineers: SupportEngineer[];
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
        MatChipsModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2 mat-dialog-title>Assign Incident</h2>
    <mat-dialog-content>
      <p class="hint">Select one or more support engineers to assign:</p>
      <mat-selection-list #assigneeList [(ngModel)]="selectedIds">
        @for (se of data.supportEngineers; track se.id) {
          <mat-list-option [value]="se.id">
            <mat-icon matListItemIcon>engineering</mat-icon>
            <span matListItemTitle>{{ se.name }}
              @if (se.onCall) {
                <mat-chip class="oncall-chip" highlighted>On Call</mat-chip>
              }
            </span>
          </mat-list-option>
        }
      </mat-selection-list>
      @if (data.supportEngineers.length === 0) {
        <p class="no-engineers">No support engineers available for this incident category.</p>
      }
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
    .oncall-chip {
      --mdc-chip-elevated-container-color: #fff3e0;
      --mdc-chip-label-text-color: #e65100;
      font-size: 11px;
      margin-left: 8px;
    }
    .no-engineers {
      text-align: center;
      color: rgba(0, 0, 0, 0.38);
      padding: 24px;
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
