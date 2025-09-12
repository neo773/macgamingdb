import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Metadata } from 'next';

export interface Stats {
  id: string;
  rows_written: number;
  rows_read: number;
  storage_bytes_used: number;
  write_requests_delegated: number;
  current_frame_no: number;
  top_query_threshold: number;
  top_queries: TopQueriesItem[];
  slowest_query_threshold: number;
  slowest_queries: SlowestQueriesItem[];
  embedded_replica_frames_replicated: number;
  query_count: number;
  query_latency: number;
}

interface TopQueriesItem {
  rows_written: number;
  rows_read: number;
  query: string;
}

interface SlowestQueriesItem {
  elapsed_ms: number;
  query: string;
  rows_written: number;
  rows_read: number;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatLatency(microseconds: number): string {
  if (microseconds >= 1_000_000) {
    return (microseconds / 1_000_000).toFixed(2) + 's';
  }
  if (microseconds >= 1_000) {
    return (microseconds / 1_000).toFixed(2) + 'ms';
  }
  return microseconds.toFixed(2) + 'μs';
}

function getQueryIntent(query: string): string {
  const upperQuery = query.toUpperCase();
  if (upperQuery.includes('SELECT COUNT')) return 'COUNT';
  if (upperQuery.includes('SELECT') && upperQuery.includes('FROM')) {
    if (upperQuery.includes('JOIN')) return 'JOIN QUERY';
    if (upperQuery.includes('WHERE')) return 'FILTERED SELECT';
    return 'SELECT';
  }
  if (upperQuery.includes('INSERT')) return 'INSERT';
  if (upperQuery.includes('UPDATE')) return 'UPDATE';
  if (upperQuery.includes('DELETE')) return 'DELETE';
  return 'QUERY';
}

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Stats() {
  const stats = await fetch('https://sqld.macgamingdb.app/turso-stats', {
    headers: {
      authorization:
        '4e9ea5fe2ed3f359815e273bb8df9be43993bab76458d9b0c4bd96f03b9eda82',
    },
  }).then((res) => res.json());

  console.log(stats);

  const typedStats = stats as Stats;
  const avgLatency =
    typedStats.query_count > 0
      ? typedStats.query_latency / typedStats.query_count
      : 0;

  // Group queries by type for better insights
  const queryAnalysis = typedStats.top_queries.reduce(
    (acc, query) => {
      const intent = getQueryIntent(query.query);
      if (!acc[intent]) acc[intent] = { count: 0, totalRows: 0 };
      acc[intent].count++;
      acc[intent].totalRows += query.rows_read;
      return acc;
    },
    {} as Record<string, { count: number; totalRows: number }>,
  );

  // Calculate metrics for cards
  const queriesPerFrame = (
    typedStats.query_count / typedStats.current_frame_no
  ).toFixed(1);
  const writeReadRatio = (
    (typedStats.rows_written / typedStats.rows_read) *
    100
  ).toFixed(1);
  const isLatencyGood = avgLatency < 500;
  const hasHighActivity = typedStats.query_count > 10000;

  return (
    <div className="container mx-auto p-6 space-y-6 [&_[data-slot=card]]:from-primary/5 [&_[data-slot=card]]:to-card dark:[&_[data-slot=card]]:bg-card [&_[data-slot=card]]:bg-gradient-to-t [&_[data-slot=card]]:shadow-xs">
      {/* Header with key insight */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Database Stats</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Instance: {typedStats.id}</span>
        </div>
      </div>

      {/* Performance Overview - Horizontal Layout */}
      <div className="grid grid-cols-4 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Total Queries</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatNumber(typedStats.query_count)}
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
              Current frame #{typedStats.current_frame_no.toLocaleString()}
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
              Total latency: {formatLatency(typedStats.query_latency)}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Data Processed</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatNumber(typedStats.rows_read + typedStats.rows_written)}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">{writeReadRatio}% writes</Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Read-heavy workload
            </div>
            <div className="text-muted-foreground">
              {formatNumber(typedStats.rows_read)} read,{' '}
              {formatNumber(typedStats.rows_written)} written
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Storage Used</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {formatBytes(typedStats.storage_bytes_used)}
            </CardTitle>
            <CardAction>
              <Badge
                variant={
                  typedStats.write_requests_delegated > 0
                    ? 'outline'
                    : 'secondary'
                }
              >
                {typedStats.write_requests_delegated > 0
                  ? 'Delegated'
                  : 'Direct'}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {typedStats.write_requests_delegated > 0
                ? 'Using delegation'
                : 'Direct writes'}
            </div>
            <div className="text-muted-foreground">
              {typedStats.write_requests_delegated > 0
                ? `${typedStats.write_requests_delegated} delegated requests`
                : 'All writes handled directly'}
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Query Analysis Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Query Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Query Patterns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(queryAnalysis)
              .sort(([, a], [, b]) => b.totalRows - a.totalRows)
              .map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{type}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.count} queries
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatNumber(data.totalRows)} rows
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Performance Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Slow queries (&gt;{typedStats.slowest_query_threshold}ms)
              </span>
              <Badge
                variant={
                  typedStats.slowest_queries.length > 5
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {typedStats.slowest_queries.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Heavy queries (&gt;
                {formatNumber(typedStats.top_query_threshold)} rows)
              </span>
              <Badge variant="outline">{typedStats.top_queries.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Worst latency</span>
              <Badge variant="destructive">
                {Math.max(
                  ...typedStats.slowest_queries.map((q) => q.elapsed_ms),
                )}
                ms
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Replica frames</span>
              <span className="font-medium">
                {typedStats.embedded_replica_frames_replicated}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Write/Read ratio</span>
              <span className="font-medium">
                {(
                  (typedStats.rows_written / typedStats.rows_read) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg query cost</span>
              <span className="font-medium">
                {Math.round(
                  (typedStats.rows_read + typedStats.rows_written) /
                    typedStats.query_count,
                )}{' '}
                rows
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Query Tables */}
      <div className="space-y-6">
        {/* Most Resource Intensive */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Intensive Queries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Processing more than{' '}
              {formatNumber(typedStats.top_query_threshold)} rows each
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query Type</TableHead>
                  <TableHead>SQL Preview</TableHead>
                  <TableHead className="text-right">Rows Read</TableHead>
                  <TableHead className="text-right">Rows Written</TableHead>
                  <TableHead className="text-right">Total Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedStats.top_queries.map((query, index) => {
                  const totalImpact = query.rows_read + query.rows_written;
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">
                          {getQueryIntent(query.query)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate block">
                          {query.query.substring(0, 80)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(query.rows_read)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {query.rows_written > 0
                          ? formatNumber(query.rows_written)
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            totalImpact > 400000 ? 'destructive' : 'secondary'
                          }
                        >
                          {formatNumber(totalImpact)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Slowest Queries */}
        <Card>
          <CardHeader>
            <CardTitle>Slowest Queries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Response times over {typedStats.slowest_query_threshold}ms
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query Type</TableHead>
                  <TableHead>SQL Preview</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Rows Affected</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typedStats.slowest_queries.map((query, index) => {
                  const efficiency =
                    (query.rows_read + query.rows_written) / query.elapsed_ms;
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">
                          {getQueryIntent(query.query)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate block">
                          {query.query.substring(0, 80)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            query.elapsed_ms > 35 ? 'destructive' : 'secondary'
                          }
                        >
                          {query.elapsed_ms}ms
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatNumber(query.rows_read + query.rows_written)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {efficiency.toFixed(0)} rows/ms
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
