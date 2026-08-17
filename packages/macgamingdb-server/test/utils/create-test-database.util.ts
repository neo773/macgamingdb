import path from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../../src/database/schema';
import { type DrizzleDB } from '../../src/database/drizzle';

const MIGRATIONS_FOLDER = path.join(
  __dirname,
  '..',
  '..',
  'drizzle',
  'migrations',
);

export type TestDatabase = {
  db: DrizzleDB;
  close: () => void;
};

export const createTestDatabase = async (): Promise<TestDatabase> => {
  const client = createClient({ url: ':memory:' });
  const db = drizzle(client, { schema });

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  return {
    db,
    close: () => client.close(),
  };
};
