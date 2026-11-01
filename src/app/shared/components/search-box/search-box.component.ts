import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

/** Campo de busca com ícone e botão de limpar. Uso: <app-search-box [(value)]="busca" /> */
@Component({
  selector: 'app-search-box',
  imports: [NgIcon],
  template: `
    <div class="search-box">
      <ng-icon name="heroMagnifyingGlass" size="18" />
      <input
        class="control"
        type="search"
        [placeholder]="placeholder()"
        [attr.aria-label]="placeholder()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
        (keydown.escape)="value.set('')"
      />
      @if (value()) {
        <button type="button" class="btn-icon search-clear" (click)="value.set('')" aria-label="Limpar busca">
          <ng-icon name="heroXMark" size="16" />
        </button>
      }
    </div>
  `,
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBoxComponent {
  readonly value = model('');
  readonly placeholder = input('Buscar...');
}
