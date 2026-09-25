export type GeocodingPrecision = 'address' | 'street' | 'area';

export type GeocodingResult = {
  label: string;

  displayName: string;
  latitude: number;
  longitude: number;

  precision: GeocodingPrecision;
  city?: string;
  state?: string;
  postcode?: string;
};

export abstract class GeocodingPort {
  abstract search(address: string): Promise<GeocodingResult[]>;
}
