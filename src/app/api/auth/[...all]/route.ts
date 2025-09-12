import { auth } from '@/lib/auth/auth';
import { createPrismaClient } from '@/lib/database/prisma';
import { toNextJsHandler } from 'better-auth/next-js';

export const GET = async (req: Request) => {
  const prisma = createPrismaClient();
  return toNextJsHandler(auth(prisma)).GET(req);
};

export const POST = async (req: Request) => {
  const prisma = createPrismaClient();
  return toNextJsHandler(auth(prisma)).POST(req);
};
