import { cookies, headers } from 'next/headers';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers/_app';
import { createTRPCContext } from '@/server/trpc';
import superjson from 'superjson';
import { PrismaClient } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * Creates server-side helpers to use tRPC procedures inside server components
 * or inside getServerSideProps/getStaticProps
 */
export async function createServerHelpers() {
  
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({
      prisma: prisma,
    }),
    transformer: superjson,
  });
}