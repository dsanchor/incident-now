import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { Priority } from '../../core/models';

@Component({
    selector: 'app-priority-chip',
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
export class PriorityChipComponent {
    readonly priority = input.required<Priority>();

    private readonly colorMap: Record<Priority, { bg: string; text: string; border: string }> = {
        low: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
        medium: { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
        high: { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
        critical: { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
    };

    private readonly priorityLabels: Record<Priority, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical',
    };

    readonly colors = computed(() => this.colorMap[this.priority()] ?? this.colorMap['medium']);

    readonly label = computed(() => this.priorityLabels[this.priority()] ?? this.priority());
}
