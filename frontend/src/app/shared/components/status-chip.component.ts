import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { IncidentStatus } from '../../core/models';

@Component({
    selector: 'app-status-chip',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <span class="chip" [style.background]="colors().bg" [style.color]="colors().text"
          [style.border-color]="colors().border">
      {{ label() }}
    </span>
  `,
    styles: `
    .chip {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }
  `,
})
export class StatusChipComponent {
    readonly status = input.required<IncidentStatus>();

    private readonly colorMap: Record<IncidentStatus, { bg: string; text: string; border: string }> = {
        open: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
        in_progress: { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
        on_hold: { bg: '#f3e5f5', text: '#7b1fa2', border: '#ce93d8' },
        resolved: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
        closed: { bg: '#efebe9', text: '#5d4037', border: '#bcaaa4' },
    };

    private readonly statusLabels: Record<IncidentStatus, string> = {
        open: 'Open',
        in_progress: 'In Progress',
        on_hold: 'On Hold',
        resolved: 'Resolved',
        closed: 'Closed',
    };

    readonly colors = computed(() => this.colorMap[this.status()] ?? this.colorMap['open']);

    readonly label = computed(() => this.statusLabels[this.status()] ?? this.status());
}
