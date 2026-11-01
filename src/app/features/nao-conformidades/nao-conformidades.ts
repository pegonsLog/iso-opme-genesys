import { Component, computed, inject, signal } from '@angular/core';
import { DataStoreService } from '../../core/services/data-store.service';
import { SeveridadeNC } from '../../core/models';

type Filtro = 'Todas' | SeveridadeNC;

import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { NgIcon } from '@ng-icons/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-nao-conformidades',
  imports: [PageHeaderComponent, NgIcon, EmptyStateComponent],
  templateUrl: './nao-conformidades.html',
  styleUrl: './nao-conformidades.scss',
})
export class NaoConformidades {
  private readonly store = inject(DataStoreService);

  protected readonly filtro = signal<Filtro>('Todas');
  protected readonly filtros: Filtro[] = ['Todas', 'Crítica', 'Grave', 'Moderada'];

  protected readonly todas = this.store.naoConformidades;

  protected readonly lista = computed(() => {
    const f = this.filtro();
    const todas = this.todas();
    return f === 'Todas' ? todas : todas.filter((nc) => nc.severidade === f);
  });

  protected readonly contagem = computed(() => ({
    criticas: this.todas().filter((nc) => nc.severidade === 'Crítica').length,
    graves: this.todas().filter((nc) => nc.severidade === 'Grave').length,
    moderadas: this.todas().filter((nc) => nc.severidade === 'Moderada').length,
  }));

  protected setFiltro(f: Filtro): void {
    this.filtro.set(f);
  }
}
