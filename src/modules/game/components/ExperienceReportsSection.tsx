import { Card, CardContent } from '@/components/ui/card';
import CreateReviewDialog from '@/modules/review/components/CreateReviewDialog';
import GameReviewCard from '@/modules/review/components/ReviewCard';
import { PromotionalBannerCrossOver } from '@/app/games/[id]/PromotionalBannerCrossOver';
import { type GameReview, type MacConfig } from '@macgamingdb/server/generated/prisma/client';

type ReviewWithMacConfig = GameReview & { macConfig?: MacConfig | null };

interface ExperienceReportsSectionProps {
  gameId: string;
  gameName: string;
  reviews: ReviewWithMacConfig[] | null;
  showCrossoverAffiliate: boolean;
}

export function ExperienceReportsSection({
  gameId,
  gameName,
  reviews,
  showCrossoverAffiliate,
}: ExperienceReportsSectionProps) {
  const hasReviews = reviews && reviews.length > 0;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Experience Reports</h2>
        {hasReviews && <CreateReviewDialog gameId={gameId} gameName={gameName} />}
      </div>

      {hasReviews ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showCrossoverAffiliate && <PromotionalBannerCrossOver />}
          {reviews.map((review) => (
            <GameReviewCard review={review} key={review.id} />
          ))}
        </div>
      ) : (
        <Card className="bg-primary-gradient">
          <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
            <h1 className="text-xl font-medium">No experience reports yet</h1>
            <CreateReviewDialog gameId={gameId} gameName={gameName} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
