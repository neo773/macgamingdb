import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'packages/macgamingdb-server/src/database/schema.ts',
  out: 'packages/macgamingdb-server/drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.LIBSQL_DATABASE_URL ?? 'file:packages/macgamingdb-server/prisma/dev.db',
    authToken: process.env.LIBSQL_DATABASE_TOKEN || undefined,
  },
});
