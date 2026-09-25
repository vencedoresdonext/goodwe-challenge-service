import { Injectable, Logger } from '@nestjs/common';
import { GeocodingPort } from '../../../integrations/geocoding/geocoding.port';
import { GeocodingCacheService } from '../../../cache/services/geocoding-cache.service';
import { GeocodeResultOutputDTO } from '../dto/io/geocode-result-io.dto';

@Injectable()
export class GeocodeAddressWebService {
  private readonly logger = new Logger(GeocodeAddressWebService.name);

  constructor(
    private readonly geocodingPort: GeocodingPort,
    private readonly geocodingCache: GeocodingCacheService,
  ) {}

  async execute(address: string): Promise<GeocodeResultOutputDTO[]> {
    const query = address.trim();

    const cached = await this.safeCacheGet(query);
    if (cached) return cached;

    const results = await this.geocodingPort.search(query);

    // Só guarda resultados não vazios: se o endereço ainda não existe na
    // base do provedor, o usuário pode tentar de novo mais tarde.
    if (results.length > 0) await this.safeCacheSet(query, results);

    return results;
  }

  // Redis fora do ar não deve impedir a busca de endereço.
  private async safeCacheGet(query: string) {
    try {
      return await this.geocodingCache.get(query);
    } catch (error) {
      this.logger.warn(`Cache de geocoding indisponível: ${error}`);
      return null;
    }
  }

  private async safeCacheSet(query: string, value: GeocodeResultOutputDTO[]) {
    try {
      await this.geocodingCache.set(query, value);
    } catch (error) {
      this.logger.warn(`Falha ao gravar cache de geocoding: ${error}`);
    }
  }
}
