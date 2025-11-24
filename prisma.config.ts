import path from "node:path";
import { config } from "dotenv";
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV === 'production') {
  config({
    path: ".env.prod",
  });
}

type Env = {
  LIBSQL_DATABASE_TOKEN: string;
  LIBSQL_DATABASE_URL: string;
};

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.NODE_ENV === 'production' 
      ? process.env.LIBSQL_DATABASE_URL! 
      : path.join('prisma', 'dev.db'),
  },
  ...(process.env.NODE_ENV === 'production' ? {
    migrate: {
      async adapter(env: Env) {
        return new PrismaLibSql({
          url: env.LIBSQL_DATABASE_URL,
          authToken: env.LIBSQL_DATABASE_TOKEN,
        })
      }
    }
  } : {})
});
