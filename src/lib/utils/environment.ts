/**
 * Environment detection utilities
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isRailway(): boolean {
  return !!process.env.RAILWAY_ENVIRONMENT;
}

export function getPort(): number {
  return parseInt(process.env.PORT || '3000');
}

export function getHost(): string {
  return process.env.HOST || '0.0.0.0';
}
