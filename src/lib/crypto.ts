//  SERVER ONLY  jangan import di client component ('use client')
//  Crypto utilities using node:crypto (AES-256-GCM, no external libraries).

import crypto from 'node:crypto';
import { randomBytes } from 'node:crypto';

const encryptionKey = process.env.MEDICAL_ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error(
    'MEDICAL_ENCRYPTION_KEY is not set. Add a 64-character hex key to your .env.local and restart the server.',
  );
}

if (encryptionKey.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(encryptionKey)) {
  throw new Error(
    `MEDICAL_ENCRYPTION_KEY must be 64 hex characters (32 bytes), got ${encryptionKey.length} characters.`,
  );
}

const algorithm = 'aes-256-gcm';
const key = Buffer.from(encryptionKey, 'hex');

export function encryptField(plaintext: string): { ciphertext: string; iv: string; tag: string } {
  const iv = randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
  };
}

export function decryptField(
  ciphertext: string,
  iv: string,
  tag: string,
): string {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  const plain = Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]);

  return plain.toString('utf8');
}

export function encryptArray(items: string[]): string {
  return JSON.stringify(items.map((item) => encryptField(item)));
}

export function decryptArray(encrypted: string): string[] {
  const payload = JSON.parse(encrypted) as { ciphertext: string; iv: string; tag: string }[];
  return payload.map((item) => decryptField(item.ciphertext, item.iv, item.tag));
}
