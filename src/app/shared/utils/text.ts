/**
 * Utilitários de texto (busca sem acentos, ordenação pt-BR, iniciais...)
 */

/** Remove acentos, normaliza caixa e espaços — ideal para buscas. */
export function normalizarTexto(valor: string | null | undefined): string {
  return (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Verifica se algum dos campos contém o termo (ignorando acentos e caixa). */
export function correspondeBusca(termo: string, ...campos: Array<string | number | null | undefined>): boolean {
  const alvo = normalizarTexto(termo);
  if (!alvo) return true;
  return campos.some((campo) => normalizarTexto(campo === null || campo === undefined ? '' : String(campo)).includes(alvo));
}

/** Comparação alfabética pt-BR (ignora acentos/caixa e ordena números naturalmente). */
export function compararTexto(a: string | null | undefined, b: string | null | undefined): number {
  return (a ?? '').localeCompare(b ?? '', 'pt-BR', { sensitivity: 'base', numeric: true });
}

/** Iniciais para avatar: "Maria Souza" → "MS" */
export function iniciais(nome: string | null | undefined): string {
  const partes = (nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}

/** Primeiro nome: "Maria Souza" → "Maria" */
export function primeiroNome(nome: string | null | undefined): string {
  return (nome ?? '').trim().split(/\s+/)[0] ?? '';
}

/** "1 resposta" / "3 respostas" */
export function pluralizar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}
