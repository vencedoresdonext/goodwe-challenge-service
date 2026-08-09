import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

/**
 * Gera um hash seguro de uma senha usando scrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifica uma senha contra um hash gerado por hashPassword.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const [salt, key] = hash.split(':');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const keyBuffer = Buffer.from(key, 'hex');
  return timingSafeEqual(derivedKey, keyBuffer);
}

/**
 * Gera um hash MD5 de um valor (útil para cache keys, etags, etc).
 */
export function md5(value: string): string {
  return createHash('md5').update(value).digest('hex');
}

/**
 * Gera um token aleatório em hex.
 */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
