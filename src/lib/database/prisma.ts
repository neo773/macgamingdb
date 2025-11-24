import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

export function createPrismaClient(): PrismaClient {
  return process.env.NODE_ENV === 'production'
    ? new PrismaClient({
        adapter: new PrismaLibSql({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        }),
      })
    : new PrismaClient({
      adapter: new PrismaLibSql({
        url: 'file:./prisma/dev.db',
      }),
    });
}
