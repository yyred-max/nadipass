//  SERVER ONLY  Patient helper utilities (server-only, keep out of client components).

import { randomBytes, createHash } from 'node:crypto';

export function generateQRToken(): string {
  return randomBytes(16).toString('hex');
}

export function hashPhone(phone: string): string {
  return createHash('sha256').update(phone.trim().replace(/\s+/g, ''), 'utf8').digest('hex');
}
