import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
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

  /** Referência ao card de detalhe/checklist, para rolar até ele ao selecionar. */
  private readonly detalheCard = viewChild<ElementRef<HTMLElement>>('detalheCard');

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly selecionadoId = signal<string | null>(null);
  protected readonly filtro = signal('');

  /** Colaboradores filtrados por nome ou cargo. */
  protected readonly colaboradoresFiltrados = computed<Colaborador[]>(() => {
    const termo = this.filtro().trim().toLowerCase();
    const lista = this.colaboradores();
    if (!termo) return lista;
    return lista.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        this.nomeCargo(c.cargoId).toLowerCase().includes(termo),
    );
  });

  protected atualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

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
    this.rolarAteDetalhe();
  }

  /** Rola a página até o checklist após ele ser renderizado. */
  private rolarAteDetalhe(): void {
    setTimeout(() => {
      this.detalheCard()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
