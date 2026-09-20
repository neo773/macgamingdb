import { Star } from 'lucide-react';
import { Card, CardContent } from 'macgamingdb-ui/display/Card';
import { PlayMethodBars } from '@/modules/game/components/PlayMethodBars';

interface GameStats {
  totalReviews: number;
  methods: {
    native: number;
    crossover: number;
    parallels: number;
    other: number;
  };
  averagePerformance: number;
}

interface GameStatsCardProps {
  stats: GameStats | null;
}

export const GameStatsCard = ({ stats }: GameStatsCardProps) => {
  return (
    <div>
      <h2 className="text-2xl text-white font-semibold">Mac Performance</h2>
      <Card className="shadow-lg mb-8 mt-4 bg-primary-gradient">
        <CardContent>
          {stats ? (
            <>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-400">
                    Experience Reports
                  </h3>
                  <p className="text-4xl font-bold text-white tabular-nums">
                    {stats.totalReviews}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="mb-1 text-sm font-medium text-gray-400">
                    Average Rating
                  </h3>
                  <p className="flex items-baseline justify-end gap-1.5">
                    <Star className="size-6 translate-y-0.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-4xl font-bold text-white tabular-nums">
                      {stats.averagePerformance.toFixed(1)}
                    </span>
                    <span className="text-lg text-gray-500">/ 5</span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700/60 pt-5">
                <h3 className="mb-4 text-sm font-medium text-gray-400">
                  Play Methods
                </h3>
                <PlayMethodBars methods={stats.methods} />
              </div>
            </>
          ) : (
            <p className="text-gray-400">No experience reports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
