import { auth } from "@/lib/auth"; // path to your auth file
import { createPrismaClient } from "@/lib/prisma";
// import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
// import { PrismaD1 } from "adapter-d1-patched";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = async (req: Request) => {
  // const { env } = getCloudflareContext();
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production" ? new PrismaLibSQL({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    }) : undefined
  );
  
  return toNextJsHandler(auth(prisma)).GET(req);
};

export const POST = async (req: Request) => {
  // const { env } = getCloudflareContext();
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production" ? new PrismaLibSQL({
      url: `${process.env.TURSO_DATABASE_URL}`,
      authToken: `${process.env.TURSO_AUTH_TOKEN}`,
    }) : undefined
  );
  
  return toNextJsHandler(auth(prisma)).POST(req);
};