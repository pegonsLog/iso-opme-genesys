import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

/**
 * Cabeçalho padrão das páginas: ícone, título, subtítulo, contador e ações (conteúdo projetado).
 *
 * <app-page-header icon="heroBuildingOffice" title="Empresas" subtitle="..." [count]="total">
 *   <button class="btn btn-primary">Nova empresa</button>
 * </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  imports: [NgIcon, RouterLink],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly eyebrow = input<string>();
  readonly count = input<number | null>(null);
  readonly backLink = input<string | unknown[]>();
  readonly backLabel = input('Voltar');
}
