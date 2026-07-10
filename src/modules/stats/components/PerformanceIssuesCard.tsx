import { Card, CardContent, CardHeader, CardTitle } from 'macgamingdb-ui/display/Card';
import { Badge } from 'macgamingdb-ui/display/Badge';
import { formatNumber } from '@/modules/stats/utils/formatNumber';
import { type Stats } from '../types/Stats';

interface PerformanceIssuesCardProps {
  stats: Stats;
}

export function PerformanceIssuesCard({ stats }: PerformanceIssuesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Slow queries (&gt;{stats.slowest_query_threshold}ms)
          </span>
          <Badge
            variant={stats.slowest_queries.length > 5 ? 'destructive' : 'secondary'}
          >
            {stats.slowest_queries.length}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Heavy queries (&gt;{formatNumber(stats.top_query_threshold)} rows)
          </span>
          <Badge variant="outline">{stats.top_queries.length}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Worst latency</span>
          <Badge variant="destructive">
            {Math.max(...stats.slowest_queries.map((query) => query.elapsed_ms))}ms
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
