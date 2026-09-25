import { describe, it, expect } from 'vitest';
import {
  formatBrazilianAddress,
  NominatimGeocodingAdapter,
  NominatimPlace,
} from './nominatim-geocoding.adapter';

const paulista: NominatimPlace = {
  lat: '-23.5614',
  lon: '-46.6559',
  display_name:
    '1578, Avenida Paulista, Bela Vista, São Paulo, Região Metropolitana de São Paulo, São Paulo, 01310-200, Brasil',
  address: {
    house_number: '1578',
    road: 'Avenida Paulista',
    suburb: 'Bela Vista',
    city: 'São Paulo',
    state: 'São Paulo',
    'ISO3166-2-lvl4': 'BR-SP',
    postcode: '01310-200',
  },
};

describe('NominatimGeocodingAdapter', () => {
  it('formats addresses in the Brazilian style', () => {
    expect(formatBrazilianAddress(paulista.address!)).toBe(
      'Avenida Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200',
    );
  });

  it('maps places to results and removes duplicates', () => {
    const results = NominatimGeocodingAdapter.toResults(
      [paulista, { ...paulista, lat: '-23.56141' }],
      'Av Paulista 1578',
    );
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      latitude: -23.5614,
      longitude: -46.6559,
      precision: 'address',
      city: 'São Paulo',
      state: 'SP',
    });
  });

  it('flags street-level precision when the number was not found', () => {
    const [result] = NominatimGeocodingAdapter.toResults(
      [
        {
          ...paulista,
          address: { ...paulista.address, house_number: undefined },
        },
      ],
      'Av Paulista 99999',
    );
    expect(result.precision).toBe('street');
  });

  it('does not treat a CEP as a house number', () => {
    const [result] = NominatimGeocodingAdapter.toResults(
      [
        {
          ...paulista,
          address: { ...paulista.address, house_number: undefined },
        },
      ],
      'Avenida Paulista 01310-200',
    );
    expect(result.precision).toBe('address');
  });
});
