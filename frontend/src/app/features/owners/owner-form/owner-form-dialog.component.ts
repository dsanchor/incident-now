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
import { OwnerService } from '../../../core/services/owner.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Owner, OWNER_ROLES } from '../../../core/models';

@Component({
    selector: 'app-owner-form-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Edit Owner' : 'New Owner' }}</h2>
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
          <mat-label>Team</mat-label>
          <input matInput formControlName="team" />
          <mat-error>Team is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            @for (role of roles; track role.value) {
              <mat-option [value]="role.value">{{ role.label }}</mat-option>
            }
          </mat-select>
          <mat-error>Role is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Department</mat-label>
          <input matInput formControlName="department" />
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
      min-width: 460px;
    }

    .form-grid mat-form-field {
      width: 100%;
    }

    .toggles {
      grid-column: 1 / -1;
      display: flex;
      gap: 24px;
      margin-top: 8px;
    }
  `,
})
export class OwnerFormDialogComponent implements OnInit {
    private readonly ownerService = inject(OwnerService);
    private readonly notification = inject(NotificationService);
    private readonly fb = inject(FormBuilder);
    readonly data = inject<{ owner: Owner | null }>(MAT_DIALOG_DATA);
    readonly dialogRef = inject(MatDialogRef<OwnerFormDialogComponent>);

    readonly roles = OWNER_ROLES;
    readonly isEdit = !!this.data.owner;
    readonly saving = signal(false);

    form!: FormGroup;

    ngOnInit(): void {
        const o = this.data.owner;
        this.form = this.fb.group({
            name: [o?.name || '', Validators.required],
            email: [o?.email || '', [Validators.required, Validators.email]],
            phone: [o?.phone || ''],
            team: [o?.team || '', Validators.required],
            role: [o?.role || '', Validators.required],
            department: [o?.department || ''],
            timezone: [o?.timezone || ''],
            slackHandle: [o?.slackHandle || ''],
            githubUsername: [o?.githubUsername || ''],
            onCall: [o?.onCall ?? false],
            active: [o?.active ?? true],
        });
    }

    save(): void {
        if (this.form.invalid) return;
        this.saving.set(true);
        const value = this.form.value;

        const op = this.isEdit
            ? this.ownerService.updateOwner(this.data.owner!.id, value)
            : this.ownerService.createOwner(value);

        op.subscribe({
            next: () => {
                this.notification.success(this.isEdit ? 'Owner updated' : 'Owner created');
                this.dialogRef.close(true);
            },
            error: () => {
                this.notification.error('Failed to save owner');
                this.saving.set(false);
            },
        });
    }
}
