//  SERVER ONLY  Prisma singleton to avoid connection leaks in Next.js dev.
//
//  Uses SQLite for local testing (sqlite:database.db) when DATABASE_URL is not set.
//  Falls back to PostgreSQL (DATABASE_URL / DIRECT_URL) otherwise.

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  if (process.env.DATABASE_PROVIDER === 'sqlite') {
    const sqlite = require('@prisma/client/edge');
    return new sqlite.PrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
