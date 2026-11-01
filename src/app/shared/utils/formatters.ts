/**
 * Utilitários de formatação seguindo os padrões do projeto:
 * - Datas: dd/mm/yyyy · Horas: hh:mm (24h)
 * - Fuso horário: Brasília (America/Sao_Paulo), independente do fuso do dispositivo
 * - Moeda: Real Brasileiro (R$ 0.000,00)
 */

export const LOCALE_PADRAO = 'pt-BR';
export const FUSO_PADRAO = 'America/Sao_Paulo';
/** Brasília não adota horário de verão desde 2019. */
const OFFSET_BRASILIA = '-03:00';

/** Valores aceitos pelas funções de data (inclui Timestamp do Firestore). */
export type EntradaData = Date | string | number | { toDate(): Date } | null | undefined;

// Instâncias reutilizadas (criar Intl.* é custoso)
const formatoData = new Intl.DateTimeFormat(LOCALE_PADRAO, {
  timeZone: FUSO_PADRAO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const formatoHora = new Intl.DateTimeFormat(LOCALE_PADRAO, {
  timeZone: FUSO_PADRAO,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

const formatoDiaSemana = new Intl.DateTimeFormat(LOCALE_PADRAO, {
  timeZone: FUSO_PADRAO,
  weekday: 'long'
});

const formatoHoraNumerica = new Intl.DateTimeFormat(LOCALE_PADRAO, {
  timeZone: FUSO_PADRAO,
  hour: 'numeric',
  hourCycle: 'h23'
});

const formatoAno = new Intl.DateTimeFormat(LOCALE_PADRAO, {
  timeZone: FUSO_PADRAO,
  year: 'numeric'
});

const formatoMoeda = new Intl.NumberFormat(LOCALE_PADRAO, {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatoInteiro = new Intl.NumberFormat(LOCALE_PADRAO, { maximumFractionDigits: 0 });

/**
 * Converte qualquer entrada de data (Date, string, número ou Timestamp) em Date.
 * Retorna null para valores vazios ou inválidos.
 */
export function toDate(value: EntradaData): Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'object' && typeof value.toDate === 'function') {
    const convertida = value.toDate();
    return isNaN(convertida.getTime()) ? null : convertida;
  }

  const data = new Date(value as string | number);
  return isNaN(data.getTime()) ? null : data;
}

/** dd/mm/yyyy (horário de Brasília) */
export function formatDate(value: EntradaData): string {
  const data = toDate(value);
  return data ? formatoData.format(data) : '';
}

/** hh:mm (horário de Brasília) */
export function formatTime(value: EntradaData): string {
  const data = toDate(value);
  return data ? formatoHora.format(data) : '';
}

/** dd/mm/yyyy hh:mm (horário de Brasília) */
export function formatDateTime(value: EntradaData): string {
  const data = toDate(value);
  return data ? `${formatoData.format(data)} ${formatoHora.format(data)}` : '';
}

/** Ex.: "quinta-feira, 22/10/2026" */
export function formatDataExtenso(value: EntradaData = new Date()): string {
  const data = toDate(value);
  return data ? `${formatoDiaSemana.format(data)}, ${formatoData.format(data)}` : '';
}

/** Data atual em Brasília pronta para nomes de arquivo: dd-mm-yyyy */
export function dataParaArquivo(value: EntradaData = new Date()): string {
  return formatDate(value).replaceAll('/', '-');
}

/** Ano corrente em Brasília */
export function anoAtual(): number {
  return Number(formatoAno.format(new Date()));
}

/** Saudação conforme o horário de Brasília */
export function saudacao(value: EntradaData = new Date()): string {
  const data = toDate(value) ?? new Date();
  const hora = Number(formatoHoraNumerica.format(data));
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Converte "yyyy-mm-dd" (valor de <input type="date">) no início do dia em Brasília.
 */
export function inicioDoDia(isoDate: string): Date | null {
  return toDate(isoDate ? `${isoDate}T00:00:00.000${OFFSET_BRASILIA}` : null);
}

/**
 * Converte "yyyy-mm-dd" (valor de <input type="date">) no fim do dia em Brasília.
 */
export function fimDoDia(isoDate: string): Date | null {
  return toDate(isoDate ? `${isoDate}T23:59:59.999${OFFSET_BRASILIA}` : null);
}

/** R$ 0.000,00 */
export function formatCurrency(value: number | null | undefined, showSymbol = true): string {
  const numero = value === null || value === undefined || isNaN(value) ? 0 : value;
  const formatado = formatoMoeda.format(numero);
  return showSymbol ? formatado : formatado.replace('R$', '').trim();
}

/** Número no padrão brasileiro (separador de milhar "." e decimal ",") */
export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat(LOCALE_PADRAO, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/** Inteiro com separador de milhar: 1.234 */
export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return formatoInteiro.format(value);
}

/**
 * Converte uma string de data no formato dd/mm/yyyy para objeto Date
 */
export function parseDate(dateString: string): Date | null {
  if (!isValidDateFormat(dateString)) return null;
  const [dia, mes, ano] = dateString.split('/').map((parte) => parseInt(parte, 10));
  return toDate(`${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T00:00:00${OFFSET_BRASILIA}`);
}

/**
 * Converte uma string hh:mm para Date (data atual)
 */
export function parseTime(timeString: string): Date | null {
  if (!isValidTimeFormat(timeString)) return null;
  const [horas, minutos] = timeString.split(':').map((parte) => parseInt(parte, 10));
  const data = new Date();
  data.setHours(horas, minutos, 0, 0);
  return data;
}

/** Valida o formato dd/mm/yyyy (incluindo dias do mês) */
export function isValidDateFormat(dateString: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateString ?? '');
  if (!match) return false;

  const dia = parseInt(match[1], 10);
  const mes = parseInt(match[2], 10);
  const ano = parseInt(match[3], 10);

  if (mes < 1 || mes > 12 || ano < 1900 || ano > 2100 || dia < 1) return false;
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return dia <= diasNoMes;
}

/** Valida o formato hh:mm (24h) */
export function isValidTimeFormat(timeString: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(timeString ?? '');
  if (!match) return false;
  const horas = parseInt(match[1], 10);
  const minutos = parseInt(match[2], 10);
  return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59;
}
