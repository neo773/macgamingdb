import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatNumber } from '@/lib/utils/format';
import { getQueryIntent } from '../utils/getQueryIntent';
import { type SlowestQueriesItem } from '../types';

interface SlowestQueriesTableProps {
  queries: SlowestQueriesItem[];
  threshold: number;
}

export function SlowestQueriesTable({
  queries,
  threshold,
}: SlowestQueriesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Slowest Queries</CardTitle>
        <p className="text-sm text-muted-foreground">
          Response times over {threshold}ms
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
            {queries.map((query, index) => {
              const efficiency =
                (query.rows_read + query.rows_written) / query.elapsed_ms;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Badge variant="outline">{getQueryIntent(query.query)}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <code className="text-xs bg-muted px-2 py-1 rounded truncate block">
                      {query.query.substring(0, 80)}...
                    </code>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={query.elapsed_ms > 35 ? 'destructive' : 'secondary'}>
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
  );
}
