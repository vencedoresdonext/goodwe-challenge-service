import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig } from 'axios';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { sleep } from '../../../common/utils';
import {
  ChargerStatus,
  ChargingTelemetry,
  ChargingTelemetryPort,
} from './charging-telemetry.port';

export interface TelemetryRequestOptions {
  headers?: Record<string, string>;
  token?: string;
  chargerId?: string;
}

@Injectable()
export class ChargingTelemetryHttpAdapter implements ChargingTelemetryPort {
  private readonly logger = new Logger(ChargingTelemetryHttpAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly configService: ConfigService,
  ) {
    this.baseUrl = configService.getOrThrow<string>('telemetry.apiUrl');
    this.apiKey = configService.get<string>('telemetry.apiKey');
  }

  protected async get<T = any>(
    url: string,
    options?: TelemetryRequestOptions,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(this.resolveUrl(url), this.buildConfig(options)),
    );
    return response.data;
  }

  protected async post<R, T = any>(
    url: string,
    data?: R,
    options?: TelemetryRequestOptions,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.post<T>(
        this.resolveUrl(url),
        data,
        this.buildConfig(options),
      ),
    );
    return response.data;
  }

  protected async put<R, T = any>(
    url: string,
    data?: R,
    options?: TelemetryRequestOptions,
  ): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.put<T>(
        this.resolveUrl(url),
        data,
        this.buildConfig(options),
      ),
    );
    return response.data;
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    actionName: string,
    fallbackValue?: T,
    shouldRetry?: (result: T) => boolean,
  ): Promise<T | null> {
    try {
      const result = await operation();
      if (!shouldRetry || !shouldRetry(result)) {
        return result;
      }
      this.logger.warn(
        `Initial attempt to ${actionName} did not return a valid result`,
      );
    } catch (error) {
      this.logger.warn(`Initial attempt to ${actionName} failed: ${error}`);
    }

    try {
      await sleep(5000);
      this.logger.log(`Retrying to ${actionName}`);
      return await operation();
    } catch (retryError) {
      this.logger.error(`Retry attempt to ${actionName} failed: ${retryError}`);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      return null;
    }
  }

  async getChargerStatus(chargerId: string): Promise<ChargerStatus | null> {
    return this.executeWithRetry(
      () => this.get<ChargerStatus>(`chargers/${chargerId}/status`),
      `get status for charger ${chargerId}`,
    );
  }

  async getChargingTelemetry(
    sessionId: string,
  ): Promise<ChargingTelemetry | null> {
    return this.executeWithRetry(
      () => this.get<ChargingTelemetry>(`sessions/${sessionId}/telemetry`),
      `get telemetry for session ${sessionId}`,
    );
  }

  async startCharging(chargerId: string): Promise<boolean | null> {
    const result = await this.executeWithRetry(
      () =>
        this.post<undefined, { success: boolean }>(
          `chargers/${chargerId}/start`,
        ),
      `start charging for ${chargerId}`,
      { success: false },
    );
    return result ? result.success : null;
  }

  async stopCharging(chargerId: string): Promise<boolean | null> {
    const result = await this.executeWithRetry(
      () =>
        this.post<undefined, { success: boolean }>(
          `chargers/${chargerId}/stop`,
        ),
      `stop charging for ${chargerId}`,
      { success: false },
    );
    return result ? result.success : null;
  }

  protected buildConfig(options?: TelemetryRequestOptions): AxiosRequestConfig {
    const headers: Record<string, string> = {
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...(options?.headers || {}),
    };

    const restOptions = { ...options };
    delete restOptions.token;
    delete restOptions.chargerId;
    delete restOptions.headers;

    return {
      ...restOptions,
      headers,
    };
  }

  protected resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const cleanBase = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
}
