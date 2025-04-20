import { PrismaClient } from '@prisma/client';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from '@prisma/adapter-d1';

/**
 * Creates a PrismaClient instance with the provided adapter
 * @param adapter Optional PrismaD1 adapter for Cloudflare D1
 * @returns PrismaClient instance
 */
export function createPrismaClient(adapter?: PrismaD1): PrismaClient {
  if (adapter) {
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}
