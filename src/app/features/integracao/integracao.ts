import { Component, computed, inject, signal } from '@angular/core';
import { DataStoreService } from '../../core/services/data-store.service';
import { Colaborador, ItemIntegracao } from '../../core/models';
import { CHECKLIST_INTEGRACAO_PADRAO } from '../../core/services/seed-data';

@Component({
  selector: 'app-integracao',
  imports: [],
  templateUrl: './integracao.html',
  styleUrl: './integracao.scss',
})
export class Integracao {
  private readonly store = inject(DataStoreService);

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly selecionadoId = signal<string | null>(null);

  protected readonly selecionado = computed<Colaborador | undefined>(() => {
    const id = this.selecionadoId();
    return id ? this.colaboradores().find((c) => c.id === id) : undefined;
  });

  /** Checklist do colaborador selecionado (usa o padrão se ainda não existe). */
  protected readonly checklist = computed<ItemIntegracao[]>(() => {
    const colab = this.selecionado();
    if (!colab) return [];
    return colab.checklistIntegracao ?? this.checklistPadrao();
  });

  protected readonly progresso = computed(() => {
    const itens = this.checklist();
    if (itens.length === 0) return 0;
    const feitos = itens.filter((i) => i.concluido).length;
    return Math.round((feitos / itens.length) * 100);
  });

  protected nomeCargo(id: string): string {
    return this.store.getCargo(id)?.nome ?? '—';
  }

  protected selecionar(id: string): void {
    this.selecionadoId.set(id);
  }

  protected async alternarItem(indice: number): Promise<void> {
    const colab = this.selecionado();
    if (!colab) return;
    const atual = this.checklist().map((i) => ({ ...i }));
    atual[indice].concluido = !atual[indice].concluido;
    const integracaoConcluida = atual.every((i) => i.concluido);
    await this.store.updateColaborador(colab.id, {
      checklistIntegracao: atual,
      integracaoConcluida,
    });
  }

  private checklistPadrao(): ItemIntegracao[] {
    return CHECKLIST_INTEGRACAO_PADRAO.map((i) => ({ ...i }));
  }
}
