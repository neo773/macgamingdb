import path from 'node:path';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../drizzle/schema';

export function createDrizzleClient() {
  const client = createClient({
    url:
      process.env.LIBSQL_DATABASE_URL ??
      'file:' + path.join(process.cwd(), 'packages', 'server', 'prisma', 'dev.db'),
    authToken: process.env.LIBSQL_DATABASE_TOKEN || undefined,
  });

  return drizzle(client, { schema });
}

export type DrizzleDB = ReturnType<typeof createDrizzleClient>;
