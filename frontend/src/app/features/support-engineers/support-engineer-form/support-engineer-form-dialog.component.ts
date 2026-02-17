import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupportEngineerService } from '../../../core/services/support-engineer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SupportEngineer, CATEGORIES } from '../../../core/models';

@Component({
    selector: 'app-support-engineer-form-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Support Engineer' : 'New Support Engineer' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" />
          <mat-error>Valid email is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Timezone</mat-label>
          <input matInput formControlName="timezone" placeholder="e.g. Europe/Madrid" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Slack Handle</mat-label>
          <input matInput formControlName="slackHandle" placeholder="e.g. @john" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>GitHub Username</mat-label>
          <input matInput formControlName="githubUsername" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Working Hours Start</mat-label>
          <input matInput formControlName="workingHoursStart" type="time" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Working Hours End</mat-label>
          <input matInput formControlName="workingHoursEnd" type="time" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-span">
          <mat-label>Categories</mat-label>
          <mat-select formControlName="categories" multiple>
            @for (cat of categoryOptions; track cat.value) {
              <mat-option [value]="cat.value">{{ cat.label }}</mat-option>
            }
          </mat-select>
          <mat-hint>Select incident categories this engineer can handle</mat-hint>
        </mat-form-field>

        <div class="toggles">
          <mat-slide-toggle formControlName="onCall">On Call</mat-slide-toggle>
          @if (isEdit) {
            <mat-slide-toggle formControlName="active">Active</mat-slide-toggle>
          }
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid || saving()"
        (click)="save()"
      >
        @if (saving()) {
          <mat-spinner diameter="20" />
        } @else {
          {{ isEdit ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
    styles: `
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
      min-width: 520px;
    }

    .form-grid mat-form-field {
      width: 100%;
    }

    .full-span {
      grid-column: 1 / -1;
    }

    .toggles {
      grid-column: 1 / -1;
      display: flex;
      gap: 24px;
      margin-top: 8px;
    }
  `,
})
export class SupportEngineerFormDialogComponent implements OnInit {
    private readonly seService = inject(SupportEngineerService);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(FormBuilder);
    readonly data = inject<{ engineer: SupportEngineer | null }>(MAT_DIALOG_DATA);
    readonly dialogRef = inject(MatDialogRef<SupportEngineerFormDialogComponent>);

    readonly categoryOptions = CATEGORIES;
    readonly isEdit = !!this.data.engineer;
    readonly saving = signal(false);

    form!: FormGroup;

    ngOnInit(): void {
        const se = this.data.engineer;
        this.form = this.fb.group({
            name: [se?.name || '', Validators.required],
            email: [se?.email || '', [Validators.required, Validators.email]],
            phone: [se?.phone || ''],
            timezone: [se?.timezone || ''],
            slackHandle: [se?.slackHandle || ''],
            githubUsername: [se?.githubUsername || ''],
            onCall: [se?.onCall ?? false],
            workingHoursStart: [se?.workingHoursStart || ''],
            workingHoursEnd: [se?.workingHoursEnd || ''],
            categories: [se?.categories || []],
            active: [se?.active ?? true],
        });
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving.set(true);
        const value = this.form.value;

        // Clean up empty time values
        if (!value.workingHoursStart) delete value.workingHoursStart;
        if (!value.workingHoursEnd) delete value.workingHoursEnd;

        const op = this.isEdit
            ? this.seService.updateSupportEngineer(this.data.engineer!.id, value)
            : this.seService.createSupportEngineer(value);

        op.subscribe({
            next: () => {
                this.notification.success(
                    this.isEdit ? 'Support engineer updated' : 'Support engineer created'
                );
                this.dialogRef.close(true);
            },
            error: () => {
                this.notification.error('Failed to save support engineer');
                this.saving.set(false);
            },
        });
    }
}
