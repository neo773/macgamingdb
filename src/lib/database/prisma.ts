import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

export function createPrismaClient(): PrismaClient {
  console.log(process.env.LIBSQL_DATABASE_URL);
  console.log(process.env.LIBSQL_DATABASE_TOKEN);
  return new PrismaClient({
    adapter: new PrismaLibSQL({
      url: `${process.env.LIBSQL_DATABASE_URL}`,
      authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
    }),
  });
}
