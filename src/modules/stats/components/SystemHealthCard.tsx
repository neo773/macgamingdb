import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Stats } from '../types';

interface SystemHealthCardProps {
  stats: Stats;
}

export function SystemHealthCard({ stats }: SystemHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">System Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Replica frames</span>
          <span className="font-medium">
            {stats.embedded_replica_frames_replicated}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Write/Read ratio</span>
          <span className="font-medium">
            {((stats.rows_written / stats.rows_read) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Avg query cost</span>
          <span className="font-medium">
            {Math.round(
              (stats.rows_read + stats.rows_written) / stats.query_count
            )}{' '}
            rows
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
