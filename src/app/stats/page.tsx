import { type Metadata } from 'next';
import { type Stats, type QueryAnalysis } from '@/modules/stats/types';
import { getQueryIntent } from '@/modules/stats/utils/getQueryIntent';
import {
  StatsOverviewCards,
  QueryPatternsCard,
  PerformanceIssuesCard,
  SystemHealthCard,
  ResourceIntensiveTable,
  SlowestQueriesTable,
} from '@/modules/stats/components';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StatsPage() {
  const stats = (await fetch(process.env.LIBSQL_STATS_ENDPOINT!, {
    headers: {
      authorization: process.env.LIBSQL_STATS_TOKEN!,
    },
  }).then((res) => res.json())) as Stats;

  const queryAnalysis = stats.top_queries.reduce(
    (acc, query) => {
      const intent = getQueryIntent(query.query);
      if (!acc[intent]) acc[intent] = { count: 0, totalRows: 0 };
      acc[intent].count++;
      acc[intent].totalRows += query.rows_read;
      return acc;
    },
    {} as Record<string, QueryAnalysis>
  );

  return (
    <div className="container mx-auto p-6 space-y-6 [&_[data-slot=card]]:from-primary/5 [&_[data-slot=card]]:to-card dark:[&_[data-slot=card]]:bg-card [&_[data-slot=card]]:bg-gradient-to-t [&_[data-slot=card]]:shadow-xs">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Database Stats</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Instance: {stats.id}</span>
        </div>
      </div>

      <StatsOverviewCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <QueryPatternsCard queryAnalysis={queryAnalysis} />
        <PerformanceIssuesCard stats={stats} />
        <SystemHealthCard stats={stats} />
      </div>

      <div className="space-y-6">
        <ResourceIntensiveTable
          queries={stats.top_queries}
          threshold={stats.top_query_threshold}
        />
        <SlowestQueriesTable
          queries={stats.slowest_queries}
          threshold={stats.slowest_query_threshold}
        />
      </div>
    </div>
  );
}
