import { createPrismaClient } from '@macgamingdb/server/database';
import { headers } from 'next/headers';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import MyReviewsClient from './client';

export default async function MyReviewsPage() {
  const prisma = createPrismaClient();

  const session = await BetterAuthClient(prisma).api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userReviews = await prisma.gameReview.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      game: true,
      macConfig: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <MyReviewsClient userReviews={userReviews} />;
}
