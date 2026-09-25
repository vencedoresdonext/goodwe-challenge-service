import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeocodingPort } from './geocoding.port';
import { NominatimGeocodingAdapter } from './nominatim-geocoding.adapter';

@Module({
  imports: [HttpModule],
  providers: [
    NominatimGeocodingAdapter,
    { provide: GeocodingPort, useExisting: NominatimGeocodingAdapter },
  ],
  exports: [GeocodingPort],
})
export class GeocodingModule {}
