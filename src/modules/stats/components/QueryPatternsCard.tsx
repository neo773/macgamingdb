import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'macgamingdb-ui/display/Card';
import { Badge } from 'macgamingdb-ui/display/Badge';
import { formatNumber } from '@/modules/stats/utils/formatNumber';
import { type QueryAnalysis } from '../types/QueryAnalysis';

interface QueryPatternsCardProps {
  queryAnalysis: Record<string, QueryAnalysis>;
}

export const QueryPatternsCard = ({
  queryAnalysis,
}: QueryPatternsCardProps) => {
  return (
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
  );
};
