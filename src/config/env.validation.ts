import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  JWT_APP_SECRET!: string;

  @IsString()
  JWT_APP_REFRESH_SECRET!: string;

  @IsString()
  JWT_WEB_SECRET!: string;

  @IsString()
  JWT_WEB_REFRESH_SECRET!: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL_SHORT?: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT_SHORT?: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL_MEDIUM?: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT_MEDIUM?: number;

  // Rate Limiting
  @IsNumber()
  THROTTLE_TTL: number;

  @IsNumber()
  THROTTLE_LIMIT: number;

  // Telemetry API
  @IsString()
  @IsUrl()
  TELEMETRY_API_URL: string;

  @IsString()
  @IsOptional()
  TELEMETRY_API_KEY?: string;

  @IsNumber()
  @IsOptional()
  THROTTLE_TTL_LONG?: number;

  @IsNumber()
  @IsOptional()
  THROTTLE_LIMIT_LONG?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation error:\n${errors.toString()}`);
  }

  return validatedConfig;
}
