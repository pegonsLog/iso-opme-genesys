import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DataStoreService } from '../../core/services/data-store.service';
import { Cargo, Colaborador, RegistroTreinamento } from '../../core/models';

interface LinhaTreinamento {
  treinamentoId: string;
  nome: string;
  obrigatorio: boolean;
  registro?: RegistroTreinamento;
  situacao: 'Apto' | 'Vencido' | 'Pendente' | 'Reprovado';
}

@Component({
  selector: 'app-pasta-auditavel',
  imports: [],
  templateUrl: './pasta-auditavel.html',
  styleUrl: './pasta-auditavel.scss',
})
export class PastaAuditavel {
  private readonly store = inject(DataStoreService);

  /** Referência ao card de detalhe, para rolar até ele ao selecionar. */
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
        (this.store.getCargo(c.cargoId)?.nome ?? '').toLowerCase().includes(termo),
    );
  });

  protected atualizarFiltro(valor: string): void {
    this.filtro.set(valor);
  }

  protected readonly colaborador = computed<Colaborador | undefined>(() => {
    const id = this.selecionadoId();
    return id ? this.colaboradores().find((c) => c.id === id) : undefined;
  });

  protected readonly cargo = computed<Cargo | undefined>(() => {
    const colab = this.colaborador();
    return colab ? this.store.getCargo(colab.cargoId) : undefined;
  });

  protected readonly naoConformidades = computed(() => {
    const colab = this.colaborador();
    return colab ? this.store.naoConformidadesDoColaborador(colab.id) : [];
  });

  /** Situação de cada treinamento (obrigatórios + extras realizados). */
  protected readonly linhasTreinamento = computed<LinhaTreinamento[]>(() => {
    const colab = this.colaborador();
    if (!colab) return [];

    const cargo = this.store.getCargo(colab.cargoId);
    const obrigatorios = new Set(
      (cargo?.treinamentosObrigatorios ?? [])
        .map((t) => t.treinamentoId)
        .filter((id): id is string => !!id),
    );
    const registros = this.store.registrosDoColaborador(colab.id);
    const hoje = new Date();

    const ids = new Set<string>([...obrigatorios, ...registros.map((r) => r.treinamentoId)]);

    return [...ids].map((treinoId) => {
      const registro = registros.find((r) => r.treinamentoId === treinoId);
      let situacao: LinhaTreinamento['situacao'] = 'Pendente';
      if (registro?.avaliacao?.resultado === 'Reprovado') {
        situacao = 'Reprovado';
      } else if (registro?.dataRealizacao) {
        situacao =
          registro.dataVencimento && new Date(registro.dataVencimento) < hoje
            ? 'Vencido'
            : 'Apto';
      }
      return {
        treinamentoId: treinoId,
        nome: this.store.getTreinamento(treinoId)?.nome ?? treinoId,
        obrigatorio: obrigatorios.has(treinoId),
        registro,
        situacao,
      };
    });
  });

  protected readonly aptoAuditoria = computed(
    () => this.naoConformidades().filter((nc) => nc.severidade === 'Crítica').length === 0,
  );

  protected selecionar(id: string): void {
    this.selecionadoId.set(id);
    this.rolarAteDetalhe();
  }

  /** Rola a página até o detalhe após ele ser renderizado. */
  private rolarAteDetalhe(): void {
    setTimeout(() => {
      this.detalheCard()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
