import { PrismaClient } from '@prisma/client';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaD1 } from '@prisma/adapter-d1';
import { D1Database } from '@cloudflare/workers-types/experimental';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaD1(getCloudflareContext().env.DB);
  prisma = new PrismaClient({
    adapter: adapter
  });
} else {
  // Use normal Prisma in development
  prisma = global.prisma || new PrismaClient();
  
  // Save reference to the PrismaClient instance in development
  global.prisma = prisma;
}

export default prisma;