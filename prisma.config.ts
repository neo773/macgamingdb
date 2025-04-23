import path from "node:path";
// import { PrismaD1HTTP } from "adapter-d1-patched";
import { config } from "dotenv";
import type { PrismaConfig } from "prisma";
import { PrismaLibSQL } from '@prisma/adapter-libsql'

// safety check so we dont run it in dev mode
if (process.env.NODE_ENV === 'production') {
  config({
    path: ".env.prod",
  });
}

type Env = {
  LIBSQL_DATABASE_TOKEN: string;
  LIBSQL_DATABASE_URL: string;
  CLOUDFLARE_D1_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
};

export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  // migrate: {
  //   async adapter(env: Env) {
  //     return new PrismaD1HTTP({
  //       CLOUDFLARE_D1_TOKEN: env.CLOUDFLARE_D1_TOKEN,
  //       CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
  //       CLOUDFLARE_DATABASE_ID: env.CLOUDFLARE_DATABASE_ID,
  //     });
  //   },
  // },
  ...(process.env.NODE_ENV === 'production' ? {
    migrate: {
      async adapter(env: Env) {
        return new PrismaLibSQL({
          url: env.LIBSQL_DATABASE_URL,
          authToken: env.LIBSQL_DATABASE_TOKEN,
        })
      }
    }
  } : {})
} satisfies PrismaConfig<Env>;
