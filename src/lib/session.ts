//  SERVER ONLY  jangan import di client component ('use client')
//  JWT session signing/verification for the BreakGlass flow (2-hour expiry).

import { SignJWT, jwtVerify } from 'jose';

const secret = process.env.SESSION_JWT_SECRET;

if (!secret) {
  throw new Error('SESSION_JWT_SECRET is not set. Add a secret to your .env.local and restart the server.');
}

const key = new TextEncoder().encode(secret);

export async function signSession(patientId: string, logId: string): Promise<string> {
  return new SignJWT({ patientId, logId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .setIssuedAt()
    .setSubject('breakglass')
    .sign(key);
}

export async function verifySession(token: string): Promise<{ patientId: string; logId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return {
      patientId: payload.patientId as string,
      logId: payload.logId as string,
    };
  } catch {
    return null;
  }
}
