import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

export function createPrismaClient(): PrismaClient {
  return process.env.NODE_ENV === 'production'
    ? new PrismaClient({
        adapter: new PrismaLibSQL({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        }),
      })
    : new PrismaClient({
        log: [{ emit: 'event', level: 'query' }],
      });
}
