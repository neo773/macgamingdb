import { getServerSession } from '@/modules/auth/utils/getServerSession';
import { createServerHelpersWithAuth } from '@/modules/trpc/utils/createServerHelpersWithAuth';
import { MyReviewsClient } from './client';

export const dynamic = 'force-dynamic';

const MyReviewsPage = async () => {
  const session = await getServerSession();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  const helpers = await createServerHelpersWithAuth();
  const userReviews = await helpers.review.listMine.fetch();

  return <MyReviewsClient userReviews={userReviews} />;
};

export default MyReviewsPage;
