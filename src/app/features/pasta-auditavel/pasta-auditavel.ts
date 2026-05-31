import { Component, computed, inject, signal } from '@angular/core';
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

  protected readonly colaboradores = this.store.colaboradores;
  protected readonly selecionadoId = signal<string | null>(null);

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
  }
}
