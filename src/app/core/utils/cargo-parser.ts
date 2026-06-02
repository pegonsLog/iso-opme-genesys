import { Cargo, Periodicidade, TreinamentoObrigatorioCargo } from '../models';

/**
 * Parser de descritivos de cargo no formato POP-02-RQ (Word/.docx colado
 * como texto). Faz extração best-effort por seções rotuladas. Campos que
 * não forem reconhecidos ficam vazios para revisão manual.
 */

const PERIODICIDADES: Periodicidade[] = ['Admissional', 'Anual', 'Semestral', 'Mensal'];

/** Resultado do parse de um único descritivo. */
export type CargoParcial = Omit<Cargo, 'id' | 'historico'>;

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Seções de conteúdo reconhecidas (em ordem de aparição no documento). */
const SECOES: { chave: string; rotulos: string[] }[] = [
  { chave: 'objetivo', rotulos: ['OBJETIVO'] },
  { chave: 'detalhamento', rotulos: ['DETALHAMENTO'] },
  { chave: 'autoridades', rotulos: ['AUTORIDADES ASSOCIADAS A FUNCAO', 'AUTORIDADES'] },
  { chave: 'formacao', rotulos: ['FORMACAO'] },
  { chave: 'experiencia', rotulos: ['EXPERIENCIA'] },
  { chave: 'competenciasTecnicas', rotulos: ['COMPETENCIAS TECNICAS'] },
  { chave: 'competenciasComportamentais', rotulos: ['COMPETENCIAS COMPORTAMENTAIS'] },
  { chave: 'treinamentos', rotulos: ['TREINAMENTOS OBRIGATORIOS'] },
  { chave: 'responsabilidades', rotulos: ['RESPONSABILIDADES'] },
  {
    chave: 'epis',
    rotulos: ['EPIS E CONDICOES ESPECIFICAS DA ATIVIDADE', 'EPIS E CONDICOES', 'EPIS'],
  },
];

/** Cabeçalhos que devem interromper a seção atual sem serem capturados. */
const IGNORAR = ['REQUISITOS DO CARGO', 'ATIVIDADES', 'IDENTIFICACAO', 'HISTORICO', 'DESCRITIVO DE CARGO'];

function ehIgnorar(linha: string): boolean {
  const n = norm(linha);
  if (n.startsWith('ASSINATURA')) return true;
  return IGNORAR.some((r) => n === r || n.startsWith(r));
}

function detectarSecao(linha: string): { chave: string; resto: string } | null {
  const n = norm(linha);
  for (const sec of SECOES) {
    for (const rotulo of sec.rotulos) {
      if (n === rotulo || n.startsWith(rotulo + ':') || n.startsWith(rotulo + ' :')) {
        const idx = linha.indexOf(':');
        const resto = idx >= 0 ? linha.slice(idx + 1).trim() : '';
        return { chave: sec.chave, resto };
      }
    }
  }
  return null;
}

function splitCols(linha: string): string[] {
  return linha
    .split(/\t|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function limparItem(s: string): string {
  return s.replace(/^[•\-\u2022\*\u25cf]+\s*/, '').trim();
}

/** Corrige erros comuns de digitação em nomes de treinamento. */
function corrigeNome(nome: string): string {
  return nome
    .replace(/\bISSO\b/gi, 'ISO')
    .replace(/\bISO\s*13485\b/gi, 'ISO 13485')
    .trim();
}

function dataParaIso(texto: string): string | undefined {
  const m = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function parseTreinamentos(linhas: string[]): TreinamentoObrigatorioCargo[] {
  const res: TreinamentoObrigatorioCargo[] = [];
  for (const raw of linhas) {
    const linha = limparItem(raw.replace(/\t/g, ' '));
    if (!linha) continue;

    // Linha contendo apenas a periodicidade → aplica ao item anterior.
    const exata = PERIODICIDADES.find((p) => norm(p) === norm(linha));
    if (exata) {
      if (res.length) res[res.length - 1].periodicidade = exata;
      continue;
    }

    // Periodicidade ao final da linha ("Nome ... Anual").
    const trailing = PERIODICIDADES.find((p) => norm(linha).endsWith(norm(p)));
    if (trailing) {
      const nome = linha.slice(0, linha.length - trailing.length).replace(/[-–\s]+$/, '').trim();
      if (nome) {
        res.push({ nome: corrigeNome(nome), periodicidade: trailing });
        continue;
      }
    }

    res.push({ nome: corrigeNome(linha), periodicidade: 'Anual' });
  }
  return res;
}

function parseIdentificacao(linhas: string[]): {
  nome: string;
  cbo: string;
  departamento: string;
  setor: string;
  superiorImediato: string;
} {
  let nome = '';
  let cbo = '';
  let departamento = '';
  let setor = '';
  let superiorImediato = '';

  const todo = linhas.join('\n');
  const mCbo = todo.match(/\b(\d{4}-\d{2})\b/);
  if (mCbo) cbo = mCbo[1];

  const idxHeader = linhas.findIndex((l) => {
    const n = norm(l);
    return n.includes('CARGO') && n.includes('CBO') && n.includes('DEPARTAMENTO');
  });

  if (idxHeader >= 0) {
    const headers = splitCols(linhas[idxHeader]).map(norm);
    for (let i = idxHeader + 1; i < linhas.length; i++) {
      if (!linhas[i].trim()) continue;
      const dados = splitCols(linhas[i]);
      if (dados.length >= 2) {
        const mapa: Record<string, string> = {};
        headers.forEach((h, idx) => (mapa[h] = dados[idx] ?? ''));
        nome = mapa['CARGO'] || nome;
        cbo = mapa['CBO'] || cbo;
        departamento = mapa['DEPARTAMENTO'] || departamento;
        setor = mapa['SETOR'] || setor;
        superiorImediato = mapa['SUPERIOR IMEDIATO'] || superiorImediato;
      }
      break;
    }
  }

  return { nome, cbo, departamento, setor, superiorImediato };
}

/** Divide um texto que pode conter vários descritivos em blocos. */
export function dividirDocumentos(texto: string): string[] {
  const linhas = texto.split('\n');
  const blocos: string[][] = [];
  let atual: string[] = [];
  for (const l of linhas) {
    if (norm(l) === 'DESCRITIVO DE CARGO' || /^[-=]{3,}$/.test(l.trim())) {
      if (atual.some((x) => x.trim())) blocos.push(atual);
      atual = [];
      continue;
    }
    atual.push(l);
  }
  if (atual.some((x) => x.trim())) blocos.push(atual);
  return blocos.map((b) => b.join('\n')).filter((b) => b.trim().length > 0);
}

/** Analisa um único descritivo de cargo. */
export function parseDescritivoCargo(texto: string): CargoParcial {
  const linhas = texto.split('\n').map((l) => l.replace(/\u00a0/g, ' ').trimEnd());

  // Coleta de seções.
  const conteudo: Record<string, string[]> = {};
  let atual: string | null = null;
  for (const linha of linhas) {
    const sec = detectarSecao(linha);
    if (sec) {
      atual = sec.chave;
      conteudo[atual] = conteudo[atual] ?? [];
      if (sec.resto) conteudo[atual].push(sec.resto);
      continue;
    }
    if (ehIgnorar(linha)) {
      atual = null;
      continue;
    }
    if (atual) conteudo[atual].push(linha);
  }

  const lista = (chave: string): string[] =>
    (conteudo[chave] ?? [])
      .join('\n')
      .split(/;|\n/)
      .map(limparItem)
      .filter((s) => s.length > 0);

  const paragrafo = (chave: string): string =>
    (conteudo[chave] ?? []).join(' ').replace(/\s+/g, ' ').trim();

  const ident = parseIdentificacao(linhas);

  const todo = texto;
  const codigo = todo.match(/POP-?\d{2}-?RQ-?\d{1,3}/i)?.[0]?.toUpperCase();
  const dataMatch =
    todo.match(/Data\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] ?? todo.match(/\d{2}\/\d{2}\/\d{4}/)?.[0];
  const revisao = todo.match(/Revis[aã]o\s*:?\s*(\d{1,3})/i)?.[1];

  return {
    codigo,
    dataDocumento: dataMatch ? dataParaIso(dataMatch) : undefined,
    revisao,
    nome: ident.nome,
    cbo: ident.cbo || undefined,
    departamento: ident.departamento || undefined,
    setor: ident.setor || undefined,
    superiorImediato: ident.superiorImediato || undefined,
    area: ident.departamento || ident.setor || '',
    objetivo: paragrafo('objetivo'),
    detalhamento: lista('detalhamento'),
    autoridades: lista('autoridades'),
    escolaridade: paragrafo('formacao'),
    experiencia: paragrafo('experiencia'),
    competenciasTecnicas: lista('competenciasTecnicas'),
    competenciasComportamentais: lista('competenciasComportamentais'),
    treinamentosObrigatorios: parseTreinamentos(conteudo['treinamentos'] ?? []),
    responsabilidades: lista('responsabilidades'),
    episCondicoes: paragrafo('epis') || undefined,
  };
}
