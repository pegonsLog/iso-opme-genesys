import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Cargo,
  Colaborador,
  Indicador,
  ItemCronograma,
  NaoConformidade,
  RegistroTreinamento,
  Treinamento,
} from '../models';
import { DataRepository } from '../data/data-repository';

/**
 * Fachada de domínio da aplicação.
 *
 * Lê os dados a partir do {@link DataRepository} (in-memory ou Firestore)
 * e expõe a lógica de negócio derivada: indicadores (módulo 9) e detecção
 * automática de não conformidades (módulo 11). Os componentes dependem
 * apenas deste serviço, sem conhecer a origem dos dados.
 */
@Injectable({ providedIn: 'root' })
export class DataStoreService {
  private readonly repo = inject(DataRepository);

  // ----- Leitura pública (delegada ao repositório) -----
  readonly cargos = this.repo.cargos;
  readonly treinamentos = this.repo.treinamentos;
  readonly colaboradores = this.repo.colaboradores;
  readonly registros = this.repo.registros;
  readonly cronograma = this.repo.cronograma;

  // Não conformidades manuais (adicionadas além das detectadas).
  private readonly _ncManuais = signal<NaoConformidade[]>([]);

  readonly naoConformidades = computed<NaoConformidade[]>(() => [
    ...this.detectarNaoConformidades(),
    ...this._ncManuais(),
  ]);

  // ============================================================
  // Indicadores (módulo 9) — calculados a partir do estado
  // ============================================================
  readonly indicadores = computed<Indicador[]>(() => {
    const colaboradores = this.colaboradores().filter((c) => c.ativo);
    const registros = this.registros();
    const hoje = new Date();

    let planejados = 0;
    let realizados = 0;
    for (const colab of colaboradores) {
      const cargo = this.cargos().find((c) => c.id === colab.cargoId);
      // Considera apenas treinamentos obrigatórios vinculados à Matriz.
      const obrigatorios = (cargo?.treinamentosObrigatorios ?? [])
        .map((t) => t.treinamentoId)
        .filter((id): id is string => !!id);
      planejados += obrigatorios.length;
      for (const treinoId of obrigatorios) {
        const temRegistro = registros.some(
          (r) => r.colaboradorId === colab.id && r.treinamentoId === treinoId && r.dataRealizacao,
        );
        if (temRegistro) realizados++;
      }
    }

    const vencidos = registros.filter(
      (r) => r.dataVencimento && new Date(r.dataVencimento) < hoje,
    ).length;

    const avaliados = registros.filter((r) => r.avaliacao && r.avaliacao.resultado !== 'Pendente');
    const aprovados = avaliados.filter((r) => r.avaliacao?.resultado === 'Apto');

    const integracoesCompletas = colaboradores.filter((c) => c.integracaoConcluida).length;

    const pct = (parte: number, total: number) =>
      total === 0 ? 0 : Math.round((parte / total) * 100);

    const treinRealizados = pct(realizados, planejados);
    const eficacia = pct(aprovados.length, avaliados.length);
    const integracao = pct(integracoesCompletas, colaboradores.length);
    const adesao = pct(realizados, planejados);

    return [
      {
        nome: 'Treinamentos realizados',
        formula: 'realizados / planejados',
        meta: '≥95%',
        valorAtual: treinRealizados,
        unidade: '%',
        atingiuMeta: treinRealizados >= 95,
      },
      {
        nome: 'Treinamentos vencidos',
        formula: 'vencidos / total',
        meta: '0',
        valorAtual: vencidos,
        unidade: 'qtd',
        atingiuMeta: vencidos === 0,
      },
      {
        nome: 'Eficácia média',
        formula: 'aprovados / avaliados',
        meta: '≥85%',
        valorAtual: eficacia,
        unidade: '%',
        atingiuMeta: eficacia >= 85,
      },
      {
        nome: 'Integração concluída',
        formula: 'integrações completas / admissões',
        meta: '100%',
        valorAtual: integracao,
        unidade: '%',
        atingiuMeta: integracao === 100,
      },
      {
        nome: 'Adesão ao SGQ',
        formula: 'treinados / total',
        meta: '≥95%',
        valorAtual: adesao,
        unidade: '%',
        atingiuMeta: adesao >= 95,
      },
    ];
  });

  // ============================================================
  // Detecção automática de não conformidades (módulo 11)
  // ============================================================
  private detectarNaoConformidades(): NaoConformidade[] {
    const ncs: NaoConformidade[] = [];
    const hoje = new Date();
    const hojeIso = hoje.toISOString().slice(0, 10);

    for (const colab of this.colaboradores().filter((c) => c.ativo)) {
      const cargo = this.cargos().find((c) => c.id === colab.cargoId);
      const obrigatorios = (cargo?.treinamentosObrigatorios ?? [])
        .map((t) => t.treinamentoId)
        .filter((id): id is string => !!id);
      const registrosColab = this.registros().filter((r) => r.colaboradorId === colab.id);

      for (const treinoId of obrigatorios) {
        const registro = registrosColab.find((r) => r.treinamentoId === treinoId);
        const treino = this.treinamentos().find((t) => t.id === treinoId);
        if (!registro || !registro.dataRealizacao) {
          ncs.push({
            id: `nc-naotreinado-${colab.id}-${treinoId}`,
            descricao: `${colab.nome} não treinado em "${treino?.nome ?? treinoId}".`,
            severidade: 'Crítica',
            colaboradorId: colab.id,
            dataDeteccao: hojeIso,
            resolvida: false,
          });
        } else if (registro.dataVencimento && new Date(registro.dataVencimento) < hoje) {
          ncs.push({
            id: `nc-vencido-${colab.id}-${treinoId}`,
            descricao: `Treinamento "${treino?.nome ?? treinoId}" de ${colab.nome} está vencido.`,
            severidade: 'Crítica',
            colaboradorId: colab.id,
            dataDeteccao: hojeIso,
            resolvida: false,
          });
        }
      }

      if (!colab.integracaoConcluida) {
        ncs.push({
          id: `nc-integracao-${colab.id}`,
          descricao: `Integração de ${colab.nome} está incompleta.`,
          severidade: 'Grave',
          colaboradorId: colab.id,
          dataDeteccao: hojeIso,
          resolvida: false,
        });
      }
    }

    return ncs;
  }

  // ============================================================
  // Helpers de consulta
  // ============================================================
  getCargo(id: string): Cargo | undefined {
    return this.cargos().find((c) => c.id === id);
  }

  getColaborador(id: string): Colaborador | undefined {
    return this.colaboradores().find((c) => c.id === id);
  }

  getTreinamento(id: string): Treinamento | undefined {
    return this.treinamentos().find((t) => t.id === id);
  }

  /** Localiza um treinamento da Matriz pelo nome (ignora acentos/caixa). */
  getTreinamentoPorNome(nome: string): Treinamento | undefined {
    const alvo = this.normalizar(nome);
    return this.treinamentos().find((t) => this.normalizar(t.nome) === alvo);
  }

  private normalizar(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Não conformidades associadas a um colaborador específico. */
  naoConformidadesDoColaborador(colaboradorId: string): NaoConformidade[] {
    return this.naoConformidades().filter((nc) => nc.colaboradorId === colaboradorId);
  }

  /** Registros de treinamento de um colaborador. */
  registrosDoColaborador(colaboradorId: string): RegistroTreinamento[] {
    return this.registros().filter((r) => r.colaboradorId === colaboradorId);
  }

  // ============================================================
  // Escrita (delegada ao repositório)
  // ============================================================
  addColaborador(colaborador: Colaborador): Promise<void> {
    return this.repo.addColaborador(colaborador);
  }

  updateColaborador(id: string, patch: Partial<Colaborador>): Promise<void> {
    return this.repo.updateColaborador(id, patch);
  }

  removeColaborador(id: string): Promise<void> {
    return this.repo.removeColaborador(id);
  }

  addTreinamento(treinamento: Treinamento): Promise<void> {
    return this.repo.addTreinamento(treinamento);
  }

  updateTreinamento(id: string, patch: Partial<Treinamento>): Promise<void> {
    return this.repo.updateTreinamento(id, patch);
  }

  removeTreinamento(id: string): Promise<void> {
    return this.repo.removeTreinamento(id);
  }

  addCargo(cargo: Cargo): Promise<void> {
    return this.repo.addCargo(cargo);
  }

  updateCargo(id: string, patch: Partial<Cargo>): Promise<void> {
    return this.repo.updateCargo(id, patch);
  }

  removeCargo(id: string): Promise<void> {
    return this.repo.removeCargo(id);
  }

  addRegistro(registro: RegistroTreinamento): Promise<void> {
    return this.repo.addRegistro(registro);
  }

  updateRegistro(id: string, patch: Partial<RegistroTreinamento>): Promise<void> {
    return this.repo.updateRegistro(id, patch);
  }

  addCronograma(item: ItemCronograma): Promise<void> {
    return this.repo.addCronograma(item);
  }

  updateCronograma(id: string, patch: Partial<ItemCronograma>): Promise<void> {
    return this.repo.updateCronograma(id, patch);
  }

  removeCronograma(id: string): Promise<void> {
    return this.repo.removeCronograma(id);
  }
}
