import { registerAs } from '@nestjs/config';

export default registerAs('telemetry', () => ({
  apiUrl: process.env.TELEMETRY_API_URL,
  apiKey: process.env.TELEMETRY_API_KEY,
}));
