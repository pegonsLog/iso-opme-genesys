/* ============================================================
   Modelos de dados — Kit RH ISO 13485 para empresa de OPME
   ============================================================ */

/** Periodicidade de um treinamento (Matriz / Cronograma). */
export type Periodicidade = 'Admissional' | 'Anual' | 'Semestral' | 'Mensal';

/** Tipo/classificação do treinamento. */
export type TipoTreinamento =
  | 'Integração'
  | 'SGQ'
  | 'Compliance'
  | 'Regulatório'
  | 'Operacional';

/** Resultado de uma avaliação de eficácia. */
export type ResultadoAvaliacao = 'Apto' | 'Reprovado' | 'Pendente';

/** Severidade de uma não conformidade. */
export type SeveridadeNC = 'Crítica' | 'Grave' | 'Moderada';

/** Status genérico de conformidade usado em checklists e indicadores. */
export type StatusConformidade = 'Conforme' | 'Pendente' | 'Não conforme';

/** Linha do histórico de revisões de um descritivo de cargo. */
export interface RevisaoHistorico {
  data: string;
  motivo: string;
  responsavel: string;
  validacao: string;
}

/**
 * Treinamento obrigatório de um cargo, como aparece no descritivo
 * (nome + periodicidade). O vínculo opcional `treinamentoId` conecta à
 * Matriz de Treinamento, habilitando a verificação de conformidade.
 */
export interface TreinamentoObrigatorioCargo {
  nome: string;
  periodicidade: Periodicidade;
  treinamentoId?: string;
}

/** 6 — Descrição de Cargo (espelha o documento POP-02-RQ-xx). */
export interface Cargo {
  id: string;

  // --- Cabeçalho documental ---
  codigo?: string;
  dataDocumento?: string; // ISO date
  revisao?: string;
  historico?: RevisaoHistorico[];

  // --- Identificação ---
  nome: string;
  cbo?: string;
  departamento?: string;
  setor?: string;
  superiorImediato?: string;
  /** Área (mantido para exibição/compatibilidade). */
  area: string;

  // --- Atividades ---
  objetivo: string;
  /** Detalhamento das atividades exercidas. */
  detalhamento: string[];
  /** Autoridades associadas à função. */
  autoridades: string[];

  // --- Requisitos ---
  escolaridade: string;
  experiencia: string;
  competenciasTecnicas: string[];
  competenciasComportamentais: string[];

  // --- Treinamentos obrigatórios ---
  treinamentosObrigatorios: TreinamentoObrigatorioCargo[];

  // --- Conduta e condições ---
  /** Responsabilidades de conduta/ética. */
  responsabilidades: string[];
  /** EPIs e condições específicas da atividade. */
  episCondicoes?: string;
}

/** 1 — Item da Matriz de Treinamento. */
export interface Treinamento {
  id: string;
  nome: string;
  tipo: TipoTreinamento;
  periodicidade: Periodicidade;
  responsavel: string;
  evidencia: string;
  /** Critério de eficácia (ex.: "≥70%", "Participação", "Auditoria"). */
  criterioEficacia: string;
  /** Cargos a que se aplica; vazio = todos os colaboradores. */
  cargosAplicaveis: string[];
}

/** 5 — Avaliação de Eficácia vinculada a um registro de treinamento. */
export interface AvaliacaoEficacia {
  notaTeorica?: number;
  resultado: ResultadoAvaliacao;
  /** Critérios práticos avaliados (atende/não atende). */
  criteriosPraticos: { criterio: string; atende: boolean }[];
  avaliador?: string;
  observacoes?: string;
}

/** Registro de um treinamento concluído (ou pendente) por um colaborador. */
export interface RegistroTreinamento {
  id: string;
  colaboradorId: string;
  treinamentoId: string;
  dataRealizacao?: string; // ISO date
  dataVencimento?: string; // ISO date
  avaliacao?: AvaliacaoEficacia;
  /** Caminho/descrição da evidência anexada. */
  evidencia?: string;
}

/** 6/7 — Colaborador e sua pasta auditável. */
export interface Colaborador {
  id: string;
  nome: string;
  cargoId: string;
  dataAdmissao: string; // ISO date
  email?: string;
  integracaoConcluida: boolean;
  ativo: boolean;
  /** 4 — Checklist de Integração ISO do colaborador. */
  checklistIntegracao?: ItemIntegracao[];
}

/** 4 — Item do Checklist de Integração ISO. */
export interface ItemIntegracao {
  item: string;
  evidencia: string;
  concluido: boolean;
}

/** 3 — Item do Checklist de Auditoria de RH. */
export interface ItemAuditoria {
  item: string;
  verificacao: string;
  status: StatusConformidade;
  observacao?: string;
}

/** 11 — Não Conformidade detectada. */
export interface NaoConformidade {
  id: string;
  descricao: string;
  severidade: SeveridadeNC;
  colaboradorId?: string;
  dataDeteccao: string; // ISO date
  resolvida: boolean;
}

/** 8 — Item do Cronograma Anual de Treinamentos. */
export interface ItemCronograma {
  mes: string;
  treinamento: string;
  publico: string;
}

/** 9 — Indicador de RH com meta. */
export interface Indicador {
  nome: string;
  formula: string;
  meta: string;
  valorAtual: number;
  unidade: '%' | 'qtd';
  atingiuMeta: boolean;
}
