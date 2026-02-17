import {
    Component,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
    FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { IncidentService } from '../../../core/services/incident.service';
import { OwnerService } from '../../../core/services/owner.service';
import { SupportEngineerService } from '../../../core/services/support-engineer.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
    Incident,
    IncidentCreate,
    IncidentUpdate,
    Owner,
    SupportEngineer,
    PRIORITIES,
    SEVERITIES,
    CATEGORIES,
} from '../../../core/models';

@Component({
    selector: 'app-incident-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="form-header">
      <button mat-icon-button routerLink="/incidents">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <h1>{{ isEdit() ? 'Edit Incident' : 'New Incident' }}</h1>
    </div>

    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48" />
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" maxlength="200" />
                <mat-error>Title is required (max 200 characters)</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="5"></textarea>
                <mat-error>Description is required</mat-error>
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline">
                  <mat-label>Priority</mat-label>
                  <mat-select formControlName="priority">
                    @for (p of priorities; track p.value) {
                      <mat-option [value]="p.value">{{ p.label }}</mat-option>
                    }
                  </mat-select>
                  <mat-error>Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Severity</mat-label>
                  <mat-select formControlName="severity">
                    @for (s of severities; track s.value) {
                      <mat-option [value]="s.value">{{ s.label }}</mat-option>
                    }
                  </mat-select>
                  <mat-error>Required</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    @for (c of categories; track c.value) {
                      <mat-option [value]="c.value">{{ c.label }}</mat-option>
                    }
                  </mat-select>
                  <mat-error>Required</mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Owner</mat-label>
                <mat-select formControlName="ownerId">
                  <mat-option [value]="null">-- Unassigned --</mat-option>
                  @for (owner of owners(); track owner.id) {
                    <mat-option [value]="owner.id">{{ owner.name }} ({{ owner.team }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Assignees (Support Engineers)</mat-label>
                <mat-select formControlName="assigneeIds" multiple>
                  @for (se of supportEngineers(); track se.id) {
                    <mat-option [value]="se.id">{{ se.name }}</mat-option>
                  }
                </mat-select>
                <mat-hint>Only engineers matching the selected category are shown</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Additional Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Workaround</mat-label>
                <textarea matInput formControlName="workaround" rows="3"></textarea>
              </mat-form-field>

              <div class="row">
                <mat-form-field appearance="outline">
                  <mat-label>Affected Users</mat-label>
                  <input matInput type="number" formControlName="affectedUsers" min="0" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Due Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="dueDate" />
                  <mat-datepicker-toggle matIconSuffix [for]="picker" />
                  <mat-datepicker #picker />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags (comma separated)</mat-label>
                <input matInput formControlName="tagsInput" placeholder="e.g. database, auth, api" />
                <mat-hint>Separate tags with commas</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Affected Systems (comma separated)</mat-label>
                <input
                  matInput
                  formControlName="affectedSystemsInput"
                  placeholder="e.g. API Gateway, Auth Service"
                />
                <mat-hint>Separate systems with commas</mat-hint>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>GitHub Integration</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="row">
                <mat-form-field appearance="outline">
                  <mat-label>Repo Owner</mat-label>
                  <input matInput formControlName="repoOwner" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Repo Name</mat-label>
                  <input matInput formControlName="repoName" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Issue Number</mat-label>
                <input matInput type="number" formControlName="issueNumber" min="1" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Pull Request Number</mat-label>
                <input matInput type="number" formControlName="pullRequestNumber" min="1" />
              </mat-form-field>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/incidents">Cancel</button>
          <button
            mat-raised-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || saving()"
          >
            @if (saving()) {
              <mat-spinner diameter="20" />
            } @else {
              {{ isEdit() ? 'Update' : 'Create' }} Incident
            }
          </button>
        </div>
      </form>
    }
  `,
    styles: `
    .form-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }

    .form-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .form-grid mat-card:first-child {
      grid-column: 1 / -1;
    }

    @media (max-width: 960px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .full-width {
      width: 100%;
    }

    .row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .row mat-form-field {
      flex: 1;
      min-width: 180px;
    }

    mat-card {
      margin-bottom: 0;
    }

    mat-card-content {
      padding-top: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-bottom: 32px;
    }
  `,
})
export class IncidentFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly incidentService = inject(IncidentService);
    private readonly ownerService = inject(OwnerService);
    private readonly supportEngineerService = inject(SupportEngineerService);
    private readonly notification = inject(NotificationService);

    readonly isEdit = signal(false);
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly owners = signal<Owner[]>([]);
    readonly supportEngineers = signal<SupportEngineer[]>([]);

    readonly priorities = PRIORITIES;
    readonly severities = SEVERITIES;
    readonly categories = CATEGORIES;

    private incidentId = '';

    readonly form = this.fb.group({
        title: ['', [Validators.required, Validators.maxLength(200)]],
        description: ['', Validators.required],
        priority: ['high', Validators.required],
        severity: ['sev2', Validators.required],
        category: ['software', Validators.required],
        ownerId: [null as string | null],
        assigneeIds: [[] as string[]],
        workaround: [''],
        affectedUsers: [null as number | null],
        dueDate: [null as Date | null],
        tagsInput: [''],
        affectedSystemsInput: [''],
        repoOwner: [''],
        repoName: [''],
        issueNumber: [null as number | null],
        pullRequestNumber: [null as number | null],
    });

    ngOnInit(): void {
        this.ownerService.getOwners({ pageSize: 100, active: true }).subscribe((res) => {
            this.owners.set(res.data);
        });

        // Load support engineers by category when category changes
        this.loadSupportEngineersByCategory(this.form.get('category')!.value as any);
        this.form.get('category')!.valueChanges.subscribe((category) => {
            if (category) {
                this.loadSupportEngineersByCategory(category as any);
                // Clear assignees when category changes as they may no longer be valid
                this.form.get('assigneeIds')!.setValue([]);
            }
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEdit.set(true);
            this.incidentId = id;
            this.loading.set(true);
            this.incidentService.getIncident(id).subscribe({
                next: (incident) => {
                    // Load support engineers for the incident's category before patching
                    this.loadSupportEngineersByCategory(incident.category);
                    this.form.patchValue({
                        title: incident.title,
                        description: incident.description,
                        priority: incident.priority,
                        severity: incident.severity,
                        category: incident.category,
                        ownerId: incident.owner?.id || null,
                        assigneeIds: incident.assignees?.map((a) => a.id) || [],
                        workaround: incident.workaround || '',
                        affectedUsers: incident.affectedUsers,
                        dueDate: incident.dueDate ? new Date(incident.dueDate) : null,
                        tagsInput: incident.tags?.join(', ') || '',
                        affectedSystemsInput: incident.affectedSystems?.join(', ') || '',
                        repoOwner: incident.githubRepo?.repoOwner || '',
                        repoName: incident.githubRepo?.repoName || '',
                        issueNumber: incident.githubRepo?.issueNumber || null,
                        pullRequestNumber: incident.githubRepo?.pullRequestNumber || null,
                    });
                    this.loading.set(false);
                },
                error: () => {
                    this.notification.error('Failed to load incident');
                    this.router.navigate(['/incidents']);
                },
            });
        }
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        this.saving.set(true);
        const v = this.form.value;

        const tags = v.tagsInput
            ? v.tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t)
            : [];
        const affectedSystems = v.affectedSystemsInput
            ? v.affectedSystemsInput
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s)
            : [];

        const githubRepo =
            v.repoOwner && v.repoName
                ? {
                    repoOwner: v.repoOwner,
                    repoName: v.repoName,
                    issueNumber: v.issueNumber || undefined,
                    pullRequestNumber: v.pullRequestNumber || undefined,
                }
                : undefined;

        if (this.isEdit()) {
            const update: IncidentUpdate = {
                title: v.title!,
                description: v.description!,
                priority: v.priority as any,
                severity: v.severity as any,
                category: v.category as any,
                ownerId: v.ownerId || undefined,
                assigneeIds: v.assigneeIds || [],
                workaround: v.workaround || undefined,
                affectedUsers: v.affectedUsers ?? undefined,
                dueDate: v.dueDate ? v.dueDate.toISOString().split('T')[0] : undefined,
                tags,
                affectedSystems,
                githubRepo,
            };

            this.incidentService.updateIncident(this.incidentId, update).subscribe({
                next: () => {
                    this.notification.success('Incident updated');
                    this.saving.set(false);
                    this.router.navigate(['/incidents', this.incidentId]);
                },
                error: () => {
                    this.notification.error('Failed to update incident');
                    this.saving.set(false);
                },
            });
        } else {
            const create: IncidentCreate = {
                title: v.title!,
                description: v.description!,
                priority: v.priority as any,
                severity: v.severity as any,
                category: v.category as any,
                ownerId: v.ownerId || undefined,
                assigneeIds: v.assigneeIds || [],
                workaround: v.workaround || undefined,
                affectedUsers: v.affectedUsers ?? undefined,
                dueDate: v.dueDate ? v.dueDate.toISOString().split('T')[0] : undefined,
                tags,
                affectedSystems,
                githubRepo,
            };

            this.incidentService.createIncident(create).subscribe({
                next: (incident) => {
                    this.notification.success('Incident created');
                    this.saving.set(false);
                    this.router.navigate(['/incidents', incident.id]);
                },
                error: () => {
                    this.notification.error('Failed to create incident');
                    this.saving.set(false);
                },
            });
        }
    }

    private loadSupportEngineersByCategory(category: string): void {
        this.supportEngineerService.getByCategory(category as any).subscribe({
            next: (engineers) => this.supportEngineers.set(engineers),
            error: () => this.supportEngineers.set([]),
        });
    }
}
