/* ============================================================
   Dados de exemplo (seed) extraídos do Kit RH ISO 13485.
   Usados enquanto a persistência é em memória / localStorage.
   Serão substituídos pelo Firebase posteriormente.
   ============================================================ */

import {
  Cargo,
  Colaborador,
  ItemAuditoria,
  ItemCronograma,
  ItemIntegracao,
  NaoConformidade,
  RegistroTreinamento,
  Treinamento,
} from '../models';

export const CARGOS_SEED: Cargo[] = [
  {
    id: 'cargo-tec-neuro',
    nome: 'Técnico de Neuromodulação',
    area: 'Operações Técnicas',
    objetivo:
      'Prestar suporte técnico seguro, rastreável e conforme requisitos regulatórios em procedimentos de neuromodulação.',
    responsabilidades: [
      'Acompanhar procedimentos cirúrgicos',
      'Realizar programação de dispositivos',
      'Garantir rastreabilidade',
      'Apoiar equipe médica',
      'Cumprir SGQ',
      'Registrar não conformidades',
    ],
    escolaridade: 'Ensino superior completo ou técnico compatível.',
    experiencia: 'Vivência hospitalar e suporte técnico.',
    competenciasTecnicas: [
      'Anatomia básica',
      'Ambiente cirúrgico',
      'Biossegurança',
      'Rastreabilidade',
      'Equipamentos médicos',
    ],
    treinamentosObrigatorios: [
      'trein-iso13485',
      'trein-tecnovigilancia',
      'trein-compliance',
      'trein-lgpd',
      'trein-biosseguranca',
    ],
  },
];

export const TREINAMENTOS_SEED: Treinamento[] = [
  {
    id: 'trein-integracao',
    nome: 'Integração Institucional',
    tipo: 'Integração',
    periodicidade: 'Admissional',
    responsavel: 'RH',
    evidencia: 'Lista de presença',
    criterioEficacia: 'Participação',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-politica-qualidade',
    nome: 'Política da Qualidade',
    tipo: 'SGQ',
    periodicidade: 'Anual',
    responsavel: 'Qualidade',
    evidencia: 'Lista + prova',
    criterioEficacia: '≥70%',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-iso13485',
    nome: 'ISO 13485',
    tipo: 'SGQ',
    periodicidade: 'Anual',
    responsavel: 'Qualidade',
    evidencia: 'Certificado',
    criterioEficacia: '≥70%',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-lgpd',
    nome: 'LGPD',
    tipo: 'Compliance',
    periodicidade: 'Anual',
    responsavel: 'RH/Jurídico',
    evidencia: 'Certificado',
    criterioEficacia: 'Participação',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-codigo-etica',
    nome: 'Código de Ética',
    tipo: 'Compliance',
    periodicidade: 'Anual',
    responsavel: 'RH',
    evidencia: 'Termo assinado',
    criterioEficacia: 'Participação',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-compliance-hosp',
    nome: 'Compliance Hospitalar',
    tipo: 'Regulatório',
    periodicidade: 'Anual',
    responsavel: 'Compliance',
    evidencia: 'Lista',
    criterioEficacia: 'Avaliação',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-rastreabilidade',
    nome: 'Rastreabilidade OPME',
    tipo: 'Operacional',
    periodicidade: 'Semestral',
    responsavel: 'Qualidade',
    evidencia: 'Checklist',
    criterioEficacia: 'Auditoria',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-tecnovigilancia',
    nome: 'Tecnovigilância',
    tipo: 'Regulatório',
    periodicidade: 'Anual',
    responsavel: 'Qualidade',
    evidencia: 'Prova',
    criterioEficacia: '≥70%',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-biosseguranca',
    nome: 'Biossegurança',
    tipo: 'Operacional',
    periodicidade: 'Anual',
    responsavel: 'SST',
    evidencia: 'Lista',
    criterioEficacia: 'Observação',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-controle-lote',
    nome: 'Controle de lote e validade',
    tipo: 'Operacional',
    periodicidade: 'Semestral',
    responsavel: 'Qualidade',
    evidencia: 'Checklist',
    criterioEficacia: 'Auditoria',
    cargosAplicaveis: [],
  },
  {
    id: 'trein-compliance',
    nome: 'Compliance',
    tipo: 'Compliance',
    periodicidade: 'Anual',
    responsavel: 'Compliance',
    evidencia: 'Termo',
    criterioEficacia: 'Participação',
    cargosAplicaveis: [],
  },
];

export const COLABORADORES_SEED: Colaborador[] = [
  {
    id: 'colab-1',
    nome: 'Ana Souza',
    cargoId: 'cargo-tec-neuro',
    dataAdmissao: '2025-01-15',
    email: 'ana.souza@empresa.com',
    integracaoConcluida: true,
    ativo: true,
  },
  {
    id: 'colab-2',
    nome: 'Carlos Pereira',
    cargoId: 'cargo-tec-neuro',
    dataAdmissao: '2026-03-01',
    email: 'carlos.pereira@empresa.com',
    integracaoConcluida: false,
    ativo: true,
  },
];

export const REGISTROS_SEED: RegistroTreinamento[] = [
  {
    id: 'reg-1',
    colaboradorId: 'colab-1',
    treinamentoId: 'trein-iso13485',
    dataRealizacao: '2025-02-10',
    dataVencimento: '2026-02-10',
    evidencia: 'Certificado ISO 13485 - Ana',
    avaliacao: {
      notaTeorica: 85,
      resultado: 'Apto',
      criteriosPraticos: [],
      avaliador: 'Qualidade',
    },
  },
  {
    id: 'reg-2',
    colaboradorId: 'colab-1',
    treinamentoId: 'trein-tecnovigilancia',
    dataRealizacao: '2025-05-20',
    dataVencimento: '2026-05-20',
    evidencia: 'Prova Tecnovigilância - Ana',
    avaliacao: {
      notaTeorica: 90,
      resultado: 'Apto',
      criteriosPraticos: [],
      avaliador: 'Qualidade',
    },
  },
];

export const CRONOGRAMA_SEED: ItemCronograma[] = [
  { mes: 'Janeiro', treinamento: 'Integração SGQ', publico: 'Novos colaboradores' },
  { mes: 'Fevereiro', treinamento: 'ISO 13485', publico: 'Todos' },
  { mes: 'Março', treinamento: 'Compliance', publico: 'Comercial' },
  { mes: 'Abril', treinamento: 'LGPD', publico: 'Todos' },
  { mes: 'Maio', treinamento: 'Tecnovigilância', publico: 'Técnicos' },
  { mes: 'Junho', treinamento: 'Biossegurança', publico: 'Operações' },
  { mes: 'Julho', treinamento: 'Rastreabilidade', publico: 'Logística' },
  { mes: 'Agosto', treinamento: 'Não conformidade e CAPA', publico: 'Lideranças' },
  { mes: 'Setembro', treinamento: 'Auditoria Interna', publico: 'Gestores' },
  { mes: 'Outubro', treinamento: 'Segurança do Trabalho', publico: 'Todos' },
  { mes: 'Novembro', treinamento: 'Reciclagem SGQ', publico: 'Todos' },
  { mes: 'Dezembro', treinamento: 'Avaliação anual de competência', publico: 'Todos' },
];

export const CHECKLIST_INTEGRACAO_PADRAO: ItemIntegracao[] = [
  { item: 'Apresentação institucional', evidencia: 'Checklist', concluido: false },
  { item: 'Política da Qualidade', evidencia: 'Assinatura', concluido: false },
  { item: 'SGQ', evidencia: 'Lista presença', concluido: false },
  { item: 'ISO 13485', evidencia: 'Certificado', concluido: false },
  { item: 'Compliance', evidencia: 'Termo', concluido: false },
  { item: 'LGPD', evidencia: 'Certificado', concluido: false },
  { item: 'Segurança do Trabalho', evidencia: 'Lista', concluido: false },
  { item: 'Fluxo de não conformidade', evidencia: 'Checklist', concluido: false },
  { item: 'CAPA', evidencia: 'Registro', concluido: false },
  { item: 'Tecnovigilância', evidencia: 'Registro', concluido: false },
  { item: 'Procedimentos da área', evidencia: 'Assinatura', concluido: false },
];

export const CHECKLIST_AUDITORIA_PADRAO: ItemAuditoria[] = [
  { item: 'Descrição de cargos atualizada', verificacao: 'Existe?', status: 'Pendente' },
  { item: 'Matriz de treinamento vigente', verificacao: 'Atualizada?', status: 'Pendente' },
  { item: 'Treinamentos vencidos', verificacao: 'Há pendências?', status: 'Pendente' },
  { item: 'Avaliação de eficácia', verificacao: 'Existe evidência?', status: 'Pendente' },
  { item: 'Integração documentada', verificacao: 'Completa?', status: 'Pendente' },
  { item: 'Controle de versão', verificacao: 'Atualizado?', status: 'Pendente' },
  { item: 'Pastas individuais', verificacao: 'Auditáveis?', status: 'Pendente' },
  { item: 'Evidência de competência', verificacao: 'Completa?', status: 'Pendente' },
  { item: 'Treinamento SGQ', verificacao: 'Vigente?', status: 'Pendente' },
  { item: 'Controle de terceiros', verificacao: 'Existe?', status: 'Pendente' },
];

export const NAO_CONFORMIDADES_SEED: NaoConformidade[] = [];
