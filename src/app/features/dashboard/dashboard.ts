import { Component, computed, inject } from '@angular/core';
import { DataStoreService } from '../../core/services/data-store.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
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
