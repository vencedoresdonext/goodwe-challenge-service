import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  validateSync,
} from 'class-validator';

const ENVIRONMENTS = ['development', 'production', 'test'] as const;
const LOG_LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
];
const BOOLEAN_STRINGS = ['true', 'false'];

class EnvironmentVariables {
  @IsIn(ENVIRONMENTS)
  @IsOptional()
  NODE_ENV: (typeof ENVIRONMENTS)[number] = 'development';

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  API_PREFIX?: string;

  @IsIn(LOG_LEVELS)
  @IsOptional()
  LOG_LEVEL?: string;

  @Matches(/^mysql:\/\/.+/, {
    message: 'DATABASE_URL deve ser uma URL mysql:// válida',
  })
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsInt()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  REDIS_DB?: number;

  @IsIn(BOOLEAN_STRINGS)
  @IsOptional()
  REDIS_TLS?: string;

  @IsString()
  @IsNotEmpty()
  JWT_APP_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_APP_REFRESH_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_WEB_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_WEB_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsInt() @IsOptional() THROTTLE_TTL_SHORT?: number;
  @IsInt() @IsOptional() THROTTLE_LIMIT_SHORT?: number;
  @IsInt() @IsOptional() THROTTLE_TTL_MEDIUM?: number;
  @IsInt() @IsOptional() THROTTLE_LIMIT_MEDIUM?: number;
  @IsInt() @IsOptional() THROTTLE_TTL_LONG?: number;
  @IsInt() @IsOptional() THROTTLE_LIMIT_LONG?: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  MERCADO_PAGO_BASE_URL?: string;

  @IsString() @IsOptional() MERCADO_PAGO_ACCESS_TOKEN?: string;
  @IsString() @IsOptional() MERCADO_PAGO_PUBLIC_KEY?: string;
  @IsString() @IsOptional() MERCADO_PAGO_WEBHOOK_SECRET?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  MERCADO_PAGO_PIX_EXPIRATION_MINUTES?: number;

  @IsUrl({ require_tld: false })
  TELEMETRY_API_URL!: string;

  @IsString()
  @IsOptional()
  TELEMETRY_API_KEY?: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  GEOCODING_API_URL?: string;

  @IsString() @IsOptional() GEOCODING_USER_AGENT?: string;
  @IsString() @IsOptional() GEOCODING_COUNTRY_CODES?: string;
  @IsString() @IsOptional() GEOCODING_LANGUAGE?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  GEOCODING_MAX_RESULTS?: number;
}

export function validate(config: Record<string, unknown>) {
  const cleaned = Object.fromEntries(
    Object.entries(config).filter(([, value]) => value !== ''),
  );

  const validatedConfig = plainToInstance(EnvironmentVariables, cleaned, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map(
        (e) =>
          `  • ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
      )
      .join('\n');
    throw new Error(`Environment validation error:\n${details}`);
  }

  return { ...config, ...validatedConfig };
}
