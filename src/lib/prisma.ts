import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
// import { PrismaD1 } from 'adapter-d1-patched';

/**
 * Creates a PrismaClient instance with the provided adapter
 * @param adapter Optional PrismaD1 adapter for Cloudflare D1
 * @returns PrismaClient instance
 */
export function createPrismaClient(adapter?: PrismaLibSQL): PrismaClient {
  if (adapter) {
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}
