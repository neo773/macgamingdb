import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: 'packages/server/src/drizzle/schema.ts',
  out: 'packages/server/drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url:
      process.env.NODE_ENV === 'production'
        ? process.env.LIBSQL_DATABASE_URL!
        : 'file:packages/server/prisma/dev.db',
    authToken:
      process.env.NODE_ENV === 'production'
        ? process.env.LIBSQL_DATABASE_TOKEN!
        : undefined,
  },
});
