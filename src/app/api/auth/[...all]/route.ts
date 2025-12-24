import { BetterAuthClient } from '@macgamingdb/server/auth';
import { createPrismaClient } from '@macgamingdb/server/database';
import { toNextJsHandler } from 'better-auth/next-js';

export const GET = async (req: Request) => {
  const prisma = createPrismaClient();
  return toNextJsHandler(BetterAuthClient(prisma)).GET(req);
};

export const POST = async (req: Request) => {
  const prisma = createPrismaClient();
  return toNextJsHandler(BetterAuthClient(prisma)).POST(req);
};
