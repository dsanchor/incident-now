import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-resolve-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2 mat-dialog-title>Resolve Incident</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Resolution</mat-label>
        <textarea matInput rows="4" [(ngModel)]="resolution" required></textarea>
        <mat-hint>Describe how the incident was resolved</mat-hint>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Root Cause</mat-label>
        <textarea matInput rows="3" [(ngModel)]="rootCause"></textarea>
        <mat-hint>Optional: what caused the incident</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!resolution.trim()"
        (click)="submit()"
      >
        Resolve
      </button>
    </mat-dialog-actions>
  `,
    styles: `
    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }
  `,
})
export class ResolveDialogComponent {
    resolution = '';
    rootCause = '';

    constructor(private dialogRef: MatDialogRef<ResolveDialogComponent>) { }

    submit(): void {
        this.dialogRef.close({
            resolution: this.resolution,
            rootCause: this.rootCause || undefined,
        });
    }
}
