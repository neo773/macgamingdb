import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

if (process.env.NODE_ENV === 'production') {
  config({
    path: ".env.prod",
  });
}

export default defineConfig({
  schema: path.join("packages", "server", "prisma", "schema.prisma"),
  datasource: {
    url: process.env.NODE_ENV === 'production'
      ? process.env.LIBSQL_DATABASE_URL!
      : 'file:' + path.join('packages', 'server', 'prisma', 'dev.db'),
  },
    migrations: {
      path: path.join("packages", "server", "prisma", "migrations"),
    },
});
