import path from 'node:path';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../drizzle/schema';

export function createDrizzleClient() {
  const client =
    process.env.NODE_ENV === 'production'
      ? createClient({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        })
      : createClient({
          url:
            'file:' +
            path.join(process.cwd(), 'packages', 'server', 'prisma', 'dev.db'),
        });

  return drizzle(client, { schema });
}

export type DrizzleDB = ReturnType<typeof createDrizzleClient>;
