import { Component, computed, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { DataStoreService } from '../../core/services/data-store.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIcon, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly store = inject(DataStoreService);

  protected readonly indicadores = this.store.indicadores;
  protected readonly naoConformidades = this.store.naoConformidades;

  protected readonly totalColaboradores = computed(
    () => this.store.colaboradores().filter((c) => c.ativo).length,
  );
  protected readonly totalTreinamentos = computed(() => this.store.treinamentos().length);
  protected readonly totalCargos = computed(() => this.store.cargos().length);

  protected readonly ncCriticas = computed(
    () => this.naoConformidades().filter((nc) => nc.severidade === 'Crítica').length,
  );
}
