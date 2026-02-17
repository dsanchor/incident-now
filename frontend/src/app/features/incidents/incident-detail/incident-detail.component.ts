import {
    Component,
    ChangeDetectionStrategy,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { IncidentService } from '../../../core/services/incident.service';
import { SupportEngineerService } from '../../../core/services/support-engineer.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
    Incident,
    Comment,
    TimelineEvent,
    SupportEngineer,
    IncidentStatus,
} from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';
import { PriorityChipComponent } from '../../../shared/components/priority-chip.component';
import {
    ConfirmDialogComponent,
    ConfirmDialogData,
} from '../../../shared/components/confirm-dialog.component';
import { ResolveDialogComponent } from './resolve-dialog.component';
import { AssignDialogComponent } from './assign-dialog.component';

@Component({
    selector: 'app-incident-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTabsModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
        MatSelectModule,
        StatusChipComponent,
        PriorityChipComponent,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (loading()) {
      <div class="loading-container">
        <mat-spinner diameter="48" />
      </div>
    } @else if (incident()) {
      <div class="detail-header">
        <div class="header-left">
          <button mat-icon-button routerLink="/incidents" matTooltip="Back to list">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <span class="incident-number">{{ incident()!.incidentNumber }}</span>
            <h1>{{ incident()!.title }}</h1>
          </div>
        </div>
        <div class="header-actions">
          @if (canResolve()) {
            <button mat-raised-button color="primary" (click)="openResolveDialog()">
              <mat-icon>check_circle</mat-icon> Resolve
            </button>
          }
          @if (canClose()) {
            <button mat-raised-button (click)="closeIncident()">
              <mat-icon>lock</mat-icon> Close
            </button>
          }
          @if (canReopen()) {
            <button mat-raised-button color="warn" (click)="reopenIncident()">
              <mat-icon>replay</mat-icon> Reopen
            </button>
          }
          <button mat-raised-button (click)="openAssignDialog()">
            <mat-icon>person_add</mat-icon> Assign
          </button>
          <button mat-stroked-button routerLink="/incidents/{{ incident()!.id }}/edit">
            <mat-icon>edit</mat-icon> Edit
          </button>
        </div>
      </div>

      <div class="detail-body">
        <div class="detail-main">
          <mat-card>
            <mat-card-content>
              <div class="meta-row">
                <app-status-chip [status]="incident()!.status" />
                <app-priority-chip [priority]="incident()!.priority" />
                <mat-chip highlighted>{{ formatEnum(incident()!.severity) }} severity</mat-chip>
                <mat-chip highlighted>{{ formatEnum(incident()!.category) }}</mat-chip>
              </div>

              <h3>Description</h3>
              <p class="description">{{ incident()!.description }}</p>

              @if (incident()!.workaround) {
                <h3>Workaround</h3>
                <p class="workaround">{{ incident()!.workaround }}</p>
              }

              @if (incident()!.rootCause) {
                <h3>Root Cause</h3>
                <p>{{ incident()!.rootCause }}</p>
              }

              @if (incident()!.resolution) {
                <h3>Resolution</h3>
                <p>{{ incident()!.resolution }}</p>
              }

              @if (incident()!.tags?.length) {
                <h3>Tags</h3>
                <div class="tags">
                  @for (tag of incident()!.tags; track tag) {
                    <mat-chip>{{ tag }}</mat-chip>
                  }
                </div>
              }

              @if (incident()!.affectedSystems?.length) {
                <h3>Affected Systems</h3>
                <div class="tags">
                  @for (sys of incident()!.affectedSystems; track sys) {
                    <mat-chip highlighted>{{ sys }}</mat-chip>
                  }
                </div>
              }

              @if (incident()!.githubRepo) {
                <h3>GitHub</h3>
                <div class="github-info">
                  @if (incident()!.githubRepo!.repoUrl) {
                    <a [href]="incident()!.githubRepo!.repoUrl" target="_blank">
                      <mat-icon>code</mat-icon>
                      {{ incident()!.githubRepo!.repoOwner }}/{{ incident()!.githubRepo!.repoName }}
                    </a>
                  }
                  @if (incident()!.githubRepo!.issueUrl) {
                    <a [href]="incident()!.githubRepo!.issueUrl" target="_blank">
                      <mat-icon>bug_report</mat-icon>
                      Issue #{{ incident()!.githubRepo!.issueNumber }}
                    </a>
                  }
                  @if (incident()!.githubRepo!.pullRequestUrl) {
                    <a [href]="incident()!.githubRepo!.pullRequestUrl" target="_blank">
                      <mat-icon>merge</mat-icon>
                      PR #{{ incident()!.githubRepo!.pullRequestNumber }}
                    </a>
                  }
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-tab-group class="tabs">
            <mat-tab label="Comments ({{ comments().length }})">
              <div class="tab-content">
                <div class="comment-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Add a comment</mat-label>
                    <textarea
                      matInput
                      rows="3"
                      [(ngModel)]="newComment"
                    ></textarea>
                  </mat-form-field>
                  <div class="comment-actions">
                    <mat-checkbox [(ngModel)]="newCommentInternal">Internal</mat-checkbox>
                    <button
                      mat-raised-button
                      color="primary"
                      [disabled]="!newComment.trim()"
                      (click)="addComment()"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                @for (comment of comments(); track comment.id) {
                  <div class="comment-item" [class.internal]="comment.isInternal">
                    <div class="comment-header">
                      <div class="comment-avatar">{{ getInitials(comment.author.name) }}</div>
                      <div>
                        <strong>{{ comment.author.name }}</strong>
                        <span class="comment-time">{{ comment.createdAt | date: 'medium' }}</span>
                      </div>
                      @if (comment.isInternal) {
                        <mat-chip class="internal-chip" highlighted>Internal</mat-chip>
                      }
                    </div>
                    <p class="comment-content">{{ comment.content }}</p>
                  </div>
                }

                @if (comments().length === 0) {
                  <p class="no-items">No comments yet</p>
                }
              </div>
            </mat-tab>

            <mat-tab label="Timeline ({{ timeline().length }})">
              <div class="tab-content">
                @for (event of timeline(); track event.id) {
                  <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <div class="timeline-header">
                        <strong>{{ formatEnum(event.eventType) }}</strong>
                        <span class="timeline-time">{{ event.timestamp | date: 'medium' }}</span>
                      </div>
                      <p>{{ event.description }}</p>
                      @if (event.previousValue || event.newValue) {
                        <div class="timeline-change">
                          @if (event.previousValue) {
                            <span class="old-value">{{ event.previousValue }}</span>
                          }
                          @if (event.previousValue && event.newValue) {
                            <mat-icon>arrow_forward</mat-icon>
                          }
                          @if (event.newValue) {
                            <span class="new-value">{{ event.newValue }}</span>
                          }
                        </div>
                      }
                      <span class="timeline-actor">by {{ event.actor?.name }}</span>
                    </div>
                  </div>
                }

                @if (timeline().length === 0) {
                  <p class="no-items">No timeline events</p>
                }
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>

        <div class="detail-sidebar">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="sidebar-field">
                <label>Owner</label>
                <span>{{ incident()!.owner?.name || 'Unassigned' }}</span>
              </div>
              <mat-divider />
              <div class="sidebar-field">
                <label>Assignees</label>
                @if (incident()!.assignees?.length) {
                  @for (a of incident()!.assignees; track a.id) {
                    <div class="assignee">{{ a.name }}</div>
                  }
                } @else {
                  <span class="muted">None</span>
                }
              </div>
              <mat-divider />
              <div class="sidebar-field">
                <label>Affected Users</label>
                <span>{{ incident()!.affectedUsers ?? 'N/A' }}</span>
              </div>
              <mat-divider />
              <div class="sidebar-field">
                <label>Created</label>
                <span>{{ incident()!.createdAt | date: 'medium' }}</span>
              </div>
              @if (incident()!.acknowledgedAt) {
                <mat-divider />
                <div class="sidebar-field">
                  <label>Acknowledged</label>
                  <span>{{ incident()!.acknowledgedAt | date: 'medium' }}</span>
                </div>
              }
              @if (incident()!.resolvedAt) {
                <mat-divider />
                <div class="sidebar-field">
                  <label>Resolved</label>
                  <span>{{ incident()!.resolvedAt | date: 'medium' }}</span>
                </div>
              }
              @if (incident()!.closedAt) {
                <mat-divider />
                <div class="sidebar-field">
                  <label>Closed</label>
                  <span>{{ incident()!.closedAt | date: 'medium' }}</span>
                </div>
              }
              @if (incident()!.dueDate) {
                <mat-divider />
                <div class="sidebar-field">
                  <label>Due Date</label>
                  <span>{{ incident()!.dueDate | date: 'mediumDate' }}</span>
                </div>
              }
              <mat-divider />
              <div class="sidebar-field">
                <label>SLA Breached</label>
                <span [class.sla-breach]="incident()!.slaBreached">
                  {{ incident()!.slaBreached ? 'Yes' : 'No' }}
                </span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    }
  `,
    styles: `
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 64px;
    }

    .detail-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .header-left h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .incident-number {
      font-family: monospace;
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .detail-body {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .detail-body {
        grid-template-columns: 1fr;
      }
    }

    .meta-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .description {
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .workaround {
      background: #fff3e0;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid #e65100;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .github-info {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .github-info a {
      display: flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: #1976d2;
    }

    .github-info a:hover {
      text-decoration: underline;
    }

    .tabs {
      margin-top: 24px;
    }

    .tab-content {
      padding: 16px 0;
    }

    .comment-form {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .comment-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 12px;
    }

    .comment-item.internal {
      background: #f5f5f5;
      border-style: dashed;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1976d2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .comment-time {
      color: rgba(0, 0, 0, 0.5);
      font-size: 12px;
      margin-left: 8px;
    }

    .internal-chip {
      --mdc-chip-elevated-container-color: #fff3e0;
      --mdc-chip-label-text-color: #e65100;
      font-size: 11px;
      margin-left: auto;
    }

    .comment-content {
      margin: 0;
      white-space: pre-wrap;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-left: 2px solid #e0e0e0;
      padding-left: 20px;
      position: relative;
    }

    .timeline-dot {
      position: absolute;
      left: -6px;
      top: 18px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #1976d2;
    }

    .timeline-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .timeline-time {
      color: rgba(0, 0, 0, 0.5);
      font-size: 12px;
    }

    .timeline-content p {
      margin: 4px 0;
    }

    .timeline-change {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .old-value {
      text-decoration: line-through;
      color: rgba(0, 0, 0, 0.5);
    }

    .new-value {
      font-weight: 500;
      color: #1976d2;
    }

    .timeline-actor {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.5);
    }

    .sidebar-field {
      padding: 12px 0;
    }

    .sidebar-field label {
      display: block;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .assignee {
      font-size: 14px;
      padding: 2px 0;
    }

    .muted {
      color: rgba(0, 0, 0, 0.38);
    }

    .sla-breach {
      color: #c62828;
      font-weight: 600;
    }

    .no-items {
      text-align: center;
      color: rgba(0, 0, 0, 0.38);
      padding: 24px;
    }

    h3 {
      margin-top: 20px;
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
    }
  `,
})
export class IncidentDetailComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly incidentService = inject(IncidentService);
    private readonly supportEngineerService = inject(SupportEngineerService);
    private readonly notification = inject(NotificationService);
    private readonly dialog = inject(MatDialog);

    readonly loading = signal(true);
    readonly incident = signal<Incident | null>(null);
    readonly comments = signal<Comment[]>([]);
    readonly timeline = signal<TimelineEvent[]>([]);

    newComment = '';
    newCommentInternal = false;

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        this.loadIncident(id);
    }

    private loadIncident(id: string): void {
        this.loading.set(true);
        forkJoin({
            incident: this.incidentService.getIncident(id),
            comments: this.incidentService.getComments(id, { pageSize: 100 }),
            timeline: this.incidentService.getTimeline(id),
        }).subscribe({
            next: (result) => {
                this.incident.set(result.incident);
                this.comments.set(result.comments.data);
                this.timeline.set(result.timeline);
                this.loading.set(false);
            },
            error: () => {
                this.notification.error('Failed to load incident');
                this.router.navigate(['/incidents']);
            },
        });
    }

    canResolve(): boolean {
        const s = this.incident()?.status;
        return s === 'open' || s === 'in_progress' || s === 'on_hold';
    }

    canClose(): boolean {
        return this.incident()?.status === 'resolved';
    }

    canReopen(): boolean {
        const s = this.incident()?.status;
        return s === 'resolved' || s === 'closed';
    }

    openResolveDialog(): void {
        const dialogRef = this.dialog.open(ResolveDialogComponent, {
            width: '500px',
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.incidentService.resolveIncident(this.incident()!.id, result).subscribe({
                    next: () => {
                        this.notification.success('Incident resolved');
                        this.loadIncident(this.incident()!.id);
                    },
                    error: () => this.notification.error('Failed to resolve incident'),
                });
            }
        });
    }

    closeIncident(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Close Incident',
                message: 'Are you sure you want to close this incident?',
                confirmText: 'Close',
            } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.incidentService.closeIncident(this.incident()!.id).subscribe({
                    next: () => {
                        this.notification.success('Incident closed');
                        this.loadIncident(this.incident()!.id);
                    },
                    error: () => this.notification.error('Failed to close incident'),
                });
            }
        });
    }

    reopenIncident(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
                title: 'Reopen Incident',
                message: 'Are you sure you want to reopen this incident?',
                confirmText: 'Reopen',
                color: 'warn',
            } as ConfirmDialogData,
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.incidentService.reopenIncident(this.incident()!.id, 'Reopened from UI').subscribe({
                    next: () => {
                        this.notification.success('Incident reopened');
                        this.loadIncident(this.incident()!.id);
                    },
                    error: () => this.notification.error('Failed to reopen incident'),
                });
            }
        });
    }

    openAssignDialog(): void {
        const category = this.incident()!.category;
        this.supportEngineerService.getByCategory(category).subscribe((engineers) => {
            const dialogRef = this.dialog.open(AssignDialogComponent, {
                width: '500px',
                data: {
                    supportEngineers: engineers,
                    currentAssignees: this.incident()!.assignees.map((a) => a.id),
                },
            });
            dialogRef.afterClosed().subscribe((assigneeIds) => {
                if (assigneeIds) {
                    this.incidentService.assignIncident(this.incident()!.id, assigneeIds).subscribe({
                        next: () => {
                            this.notification.success('Assignees updated');
                            this.loadIncident(this.incident()!.id);
                        },
                        error: () => this.notification.error('Failed to update assignees'),
                    });
                }
            });
        });
    }

    addComment(): void {
        if (!this.newComment.trim()) return;
        this.incidentService
            .addComment(this.incident()!.id, {
                content: this.newComment,
                isInternal: this.newCommentInternal,
            })
            .subscribe({
                next: () => {
                    this.notification.success('Comment added');
                    this.newComment = '';
                    this.newCommentInternal = false;
                    this.loadIncident(this.incident()!.id);
                },
                error: () => this.notification.error('Failed to add comment'),
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
