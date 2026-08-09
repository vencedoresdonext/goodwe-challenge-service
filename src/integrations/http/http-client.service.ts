import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

/**
 * Wrapper tipado do HttpService (Axios) com logging automático.
 * Use este service para todas as integrações com APIs externas.
 */
@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  constructor(private readonly httpService: HttpService) {}

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('GET', url, config);
  }

  async post<R, T = any>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('POST', url, { ...config, data });
  }

  async put<R, T = any>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PUT', url, { ...config, data });
  }

  async patch<R, T = any>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('PATCH', url, { ...config, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, config);
  }

  private async request<T>(
    method: string,
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>({
          ...config,
          method,
          url,
        }),
      );

      const duration = Date.now() - startTime;
      this.logger.log(`${method} ${url} ${response.status} - ${duration}ms`);

      return response.data;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      let status = 'N/A';
      let message = 'Unknown error';

      if (axios.isAxiosError(error)) {
        status = error.response?.status?.toString() || 'N/A';
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      this.logger.error(
        `${method} ${url} ${status} - ${duration}ms - ${message}`,
      );
      throw error;
    }
  }
}
