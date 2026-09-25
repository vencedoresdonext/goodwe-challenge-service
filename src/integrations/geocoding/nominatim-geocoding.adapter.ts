import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  GeocodingPort,
  GeocodingPrecision,
  GeocodingResult,
} from './geocoding.port';

type NominatimAddress = {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  'ISO3166-2-lvl4'?: string;
  postcode?: string;
};

export type NominatimPlace = {
  lat: string;
  lon: string;
  display_name: string;
  category?: string;
  type?: string;
  addresstype?: string;
  address?: NominatimAddress;
};

const MIN_INTERVAL_MS = 1100;

@Injectable()
export class NominatimGeocodingAdapter implements GeocodingPort {
  private readonly logger = new Logger(NominatimGeocodingAdapter.name);
  private readonly baseUrl: string;
  private readonly userAgent: string;
  private readonly countryCodes: string;
  private readonly language: string;
  private readonly maxResults: number;

  // Fila simples para respeitar o limite de 1 req/s dentro desta instância.
  private queue: Promise<unknown> = Promise.resolve();
  private lastRequestAt = 0;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.baseUrl = configService
      .get<string>('geocoding.apiUrl', 'https://nominatim.openstreetmap.org')
      .replace(/\/$/, '');
    this.userAgent = configService.get<string>(
      'geocoding.userAgent',
      'goodwe-chargegrid/1.0',
    );
    this.countryCodes = configService.get<string>('geocoding.countryCodes', '');
    this.language = configService.get<string>('geocoding.language', 'pt-BR');
    this.maxResults = configService.get<number>('geocoding.maxResults', 5);
  }

  async search(address: string): Promise<GeocodingResult[]> {
    const places = await this.throttled(() => this.request(address));
    return NominatimGeocodingAdapter.toResults(places, address);
  }

  private async request(address: string): Promise<NominatimPlace[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<NominatimPlace[]>(`${this.baseUrl}/search`, {
          timeout: 8000,
          params: {
            q: address,
            format: 'jsonv2',
            addressdetails: 1,
            limit: this.maxResults,
            ...(this.countryCodes && { countrycodes: this.countryCodes }),
            'accept-language': this.language,
          },
          headers: { 'User-Agent': this.userAgent },
        }),
      );
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      this.logger.error(`Falha ao geocodificar "${address}": ${error}`);
      throw new ServiceUnavailableException(
        'Não foi possível buscar o endereço agora. Tente novamente em instantes.',
      );
    }
  }

  private throttled<T>(operation: () => Promise<T>): Promise<T> {
    const run = async () => {
      const wait = this.lastRequestAt + MIN_INTERVAL_MS - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      try {
        return await operation();
      } finally {
        this.lastRequestAt = Date.now();
      }
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  static toResults(places: NominatimPlace[], query: string): GeocodingResult[] {
    const queryHasNumber = /\d/.test(query.replace(/\d{5}-?\d{3}/g, ''));
    const seen = new Set<string>();
    const results: GeocodingResult[] = [];

    for (const place of places) {
      const latitude = Number(place.lat);
      const longitude = Number(place.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      const address = place.address ?? {};
      const label = formatBrazilianAddress(address) || place.display_name;
      const key = `${label}|${latitude.toFixed(4)}|${longitude.toFixed(4)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      results.push({
        label,
        displayName: place.display_name,
        latitude,
        longitude,
        precision: precisionOf(address, queryHasNumber),
        city: cityOf(address),
        state: stateOf(address),
        postcode: address.postcode,
      });
    }

    return results;
  }
}

function cityOf(a: NominatimAddress): string | undefined {
  return a.city ?? a.town ?? a.village ?? a.municipality;
}

function stateOf(a: NominatimAddress): string | undefined {
  const iso = a['ISO3166-2-lvl4'];
  if (iso?.includes('-')) return iso.split('-')[1];
  return a.state;
}

function precisionOf(
  a: NominatimAddress,
  queryHasNumber: boolean,
): GeocodingPrecision {
  if (a.house_number) return 'address';
  if (a.road || a.pedestrian) return queryHasNumber ? 'street' : 'address';
  return 'area';
}

export function formatBrazilianAddress(a: NominatimAddress): string {
  const street = a.road ?? a.pedestrian;
  const district = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district;
  const city = cityOf(a);
  const state = stateOf(a);

  const streetPart = street
    ? [street, a.house_number].filter(Boolean).join(', ')
    : '';
  const cityPart = [city, state].filter(Boolean).join(' - ');
  const head = [streetPart, district].filter(Boolean).join(' - ');

  return [head, cityPart, a.postcode].filter(Boolean).join(', ');
}
