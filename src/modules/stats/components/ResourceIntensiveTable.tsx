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
import { type TopQueriesItem } from '../types';

interface ResourceIntensiveTableProps {
  queries: TopQueriesItem[];
  threshold: number;
}

export function ResourceIntensiveTable({
  queries,
  threshold,
}: ResourceIntensiveTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Intensive Queries</CardTitle>
        <p className="text-sm text-muted-foreground">
          Processing more than {formatNumber(threshold)} rows each
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
            {queries.map((query, index) => {
              const totalImpact = query.rows_read + query.rows_written;
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
                  <TableCell className="text-right font-mono text-sm">
                    {formatNumber(query.rows_read)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {query.rows_written > 0 ? formatNumber(query.rows_written) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={totalImpact > 400000 ? 'destructive' : 'secondary'}>
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
  );
}
