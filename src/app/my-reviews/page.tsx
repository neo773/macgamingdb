import { createDrizzleClient } from '@macgamingdb/server/database';
import { headers } from 'next/headers';
import { BetterAuthClient } from '@macgamingdb/server/auth';
import MyReviewsClient from './client';
import { gameReviews } from '@macgamingdb/server/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export default async function MyReviewsPage() {
  const db = createDrizzleClient();

  const session = await BetterAuthClient(db).api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userReviews = await db.query.gameReviews.findMany({
    where: eq(gameReviews.userId, session.user.id),
    with: {
      game: true,
      macConfig: true,
    },
    orderBy: desc(gameReviews.createdAt),
  });

  return <MyReviewsClient userReviews={userReviews} />;
}
