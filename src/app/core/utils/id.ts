/** Gera um id único simples (sem dependências externas). */
export function gerarId(prefixo: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefixo}-${Date.now().toString(36)}-${random}`;
}
