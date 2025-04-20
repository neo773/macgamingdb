import { auth } from "@/lib/auth"; // path to your auth file
import { createPrismaClient } from "@/lib/prisma";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from "@prisma/adapter-d1";
import { toNextJsHandler } from "better-auth/next-js";

export const GET = async (req: Request) => {
  const { env } = getCloudflareContext();
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production" ? new PrismaD1(env.DB) : undefined
  );
  
  return toNextJsHandler(auth(prisma)).GET(req);
};

export const POST = async (req: Request) => {
  const { env } = getCloudflareContext();
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production" ? new PrismaD1(env.DB) : undefined
  );
  
  return toNextJsHandler(auth(prisma)).POST(req);
};