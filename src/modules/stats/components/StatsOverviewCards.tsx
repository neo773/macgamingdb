import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatBytes, formatLatency } from '@/lib/utils/format';
import { type Stats } from '../types';

interface StatsOverviewCardsProps {
  stats: Stats;
}

export function StatsOverviewCards({ stats }: StatsOverviewCardsProps) {
  const avgLatency = stats.query_count > 0 ? stats.query_latency / stats.query_count : 0;
  const queriesPerFrame = (stats.query_count / stats.current_frame_no).toFixed(1);
  const writeReadRatio = ((stats.rows_written / stats.rows_read) * 100).toFixed(1);
  const isLatencyGood = avgLatency < 500;
  const hasHighActivity = stats.query_count > 10000;

  return (
    <div className="grid grid-cols-4 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Queries</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.query_count)}
          </CardTitle>
          <CardAction>
            <Badge variant={hasHighActivity ? 'default' : 'outline'}>
              {queriesPerFrame}/frame
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {hasHighActivity ? 'High activity' : 'Moderate activity'}
          </div>
          <div className="text-muted-foreground">
            Current frame #{stats.current_frame_no.toLocaleString()}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Average Latency</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatLatency(avgLatency)}
          </CardTitle>
          <CardAction>
            <Badge variant={isLatencyGood ? 'default' : 'destructive'}>
              {isLatencyGood ? 'Good' : 'Slow'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLatencyGood ? 'Performing well' : 'Needs attention'}
          </div>
          <div className="text-muted-foreground">
            Total latency: {formatLatency(stats.query_latency)}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Data Processed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(stats.rows_read + stats.rows_written)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">{writeReadRatio}% writes</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Read-heavy workload</div>
          <div className="text-muted-foreground">
            {formatNumber(stats.rows_read)} read, {formatNumber(stats.rows_written)} written
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Storage Used</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatBytes(stats.storage_bytes_used)}
          </CardTitle>
          <CardAction>
            <Badge
              variant={stats.write_requests_delegated > 0 ? 'outline' : 'secondary'}
            >
              {stats.write_requests_delegated > 0 ? 'Delegated' : 'Direct'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.write_requests_delegated > 0 ? 'Using delegation' : 'Direct writes'}
          </div>
          <div className="text-muted-foreground">
            {stats.write_requests_delegated > 0
              ? `${stats.write_requests_delegated} delegated requests`
              : 'All writes handled directly'}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
