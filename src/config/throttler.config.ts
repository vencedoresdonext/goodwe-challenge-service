import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  short: {
    ttl: parseInt(process.env.THROTTLE_TTL_SHORT || '1000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT_SHORT || '30', 10),
  },
  medium: {
    ttl: parseInt(process.env.THROTTLE_TTL_MEDIUM || '10000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT_MEDIUM || '150', 10),
  },
  long: {
    ttl: parseInt(process.env.THROTTLE_TTL_LONG || '60000', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT_LONG || '600', 10),
  },
}));
