import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  appSecret: process.env.JWT_APP_SECRET || 'default-app-secret',
  webSecret: process.env.JWT_WEB_SECRET || 'default-web-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  appRefreshSecret:
    process.env.JWT_APP_REFRESH_SECRET || 'default-app-refresh-secret',
  webRefreshSecret:
    process.env.JWT_WEB_REFRESH_SECRET || 'default-web-refresh-secret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
