import path from "node:path";
import { PrismaD1HTTP } from "@prisma/adapter-d1";
import { config } from "dotenv";
import type { PrismaConfig } from "prisma";

config({
  path: ".env.prod",
});

type Env = {
  CLOUDFLARE_D1_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
};

export default {
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter(env: Env) {
      return new PrismaD1HTTP({
        CLOUDFLARE_D1_TOKEN: env.CLOUDFLARE_D1_TOKEN,
        CLOUDFLARE_ACCOUNT_ID: env.CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_DATABASE_ID: env.CLOUDFLARE_DATABASE_ID,
      });
    },
  },
} satisfies PrismaConfig<Env>;
