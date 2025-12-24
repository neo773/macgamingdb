import { Card, CardContent } from '@/components/ui/card';

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

export function GameStatsCard({ stats }: GameStatsCardProps) {
  return (
    <div>
      <h1 className="text-2xl text-white font-semibold">Mac Performance Stats</h1>
      <Card className="shadow-lg mb-8 mt-4 bg-primary-gradient">
        <CardContent>
          {stats ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-300">
                  Experience Reports
                </h3>
                <p className="text-3xl font-bold text-white">{stats.totalReviews}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-300">Play Methods</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Native</span>
                    <span className="font-medium text-white">{stats.methods.native}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>CrossOver</span>
                    <span className="font-medium text-white">{stats.methods.crossover}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Parallels</span>
                    <span className="font-medium text-white">{stats.methods.parallels}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Other</span>
                    <span className="font-medium text-white">{stats.methods.other}</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 text-gray-300">Average Rating</h3>
                <div className="flex items-center">
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${(stats.averagePerformance / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-white">
                    {stats.averagePerformance.toFixed(1)}/5
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p>No experience reports yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
