import { getServerSession } from '@/lib/auth/server';
import { createServerHelpersWithAuth } from '@/lib/trpc/server';
import MyReviewsClient from './client';

export const dynamic = 'force-dynamic';

export default async function MyReviewsPage() {
  const session = await getServerSession();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const helpers = await createServerHelpersWithAuth();
  const userReviews = await helpers.review.listMine.fetch();

  return <MyReviewsClient userReviews={userReviews} />;
}
