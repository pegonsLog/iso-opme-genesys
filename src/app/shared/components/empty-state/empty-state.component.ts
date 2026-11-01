import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/** Estado vazio padrão (ícone, título, descrição e ações projetadas). */
@Component({
  selector: 'app-empty-state',
  imports: [NgIcon],
  template: `
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">
        <ng-icon [name]="icon()" size="34" />
      </div>
      <h3>{{ title() }}</h3>
      @if (description()) {
        <p>{{ description() }}</p>
      }
      <div class="empty-actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty-actions:empty {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  readonly icon = input('heroInbox');
  readonly title = input.required<string>();
  readonly description = input<string>();
}
