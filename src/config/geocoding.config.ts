import { registerAs } from '@nestjs/config';

export default registerAs('geocoding', () => ({
  apiUrl:
    process.env.GEOCODING_API_URL || 'https://nominatim.openstreetmap.org',
  userAgent:
    process.env.GEOCODING_USER_AGENT ||
    'goodwe-chargegrid/1.0 (contato@goodwe.com.br)',
  countryCodes: process.env.GEOCODING_COUNTRY_CODES || 'br',
  language: process.env.GEOCODING_LANGUAGE || 'pt-BR',
  maxResults: parseInt(process.env.GEOCODING_MAX_RESULTS || '5', 10),
}));
