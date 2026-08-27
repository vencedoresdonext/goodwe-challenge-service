/** TTLs padrão em milissegundos */
export const CacheTTL = {
  /** 30 segundos */
  SHORT: 30 * 1000,
  /** 5 minutos */
  MEDIUM: 5 * 60 * 1000,
  /** 30 minutos */
  LONG: 30 * 60 * 1000,
  /** 1 hora */
  VERY_LONG: 60 * 60 * 1000,
  /** 24 horas */
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

/** Prefixos de chave para organização no Redis */
export const CachePrefix = {
  USER: 'user:',
  SESSION: 'session:',
  CONFIG: 'config:',
  RATE_LIMIT: 'rate-limit:',
  LOGIN: 'login:',
} as const;
