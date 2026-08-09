/**
 * Retorna a data atual em ISO string.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Adiciona minutos a uma data.
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Adiciona dias a uma data.
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Verifica se uma data já expirou.
 */
export function isExpired(date: Date): boolean {
  return new Date() > date;
}

/**
 * Retorna a diferença em milissegundos entre duas datas.
 */
export function diffMs(dateA: Date, dateB: Date): number {
  return Math.abs(dateA.getTime() - dateB.getTime());
}
