import { type Metadata } from 'next';
import { type Stats } from '@/modules/stats/types/Stats';
import { type QueryAnalysis } from '@/modules/stats/types/QueryAnalysis';
import { getQueryIntent } from '@/modules/stats/utils/getQueryIntent';
import { StatsOverviewCards } from '@/modules/stats/components/StatsOverviewCards';
import { QueryPatternsCard } from '@/modules/stats/components/QueryPatternsCard';
import { PerformanceIssuesCard } from '@/modules/stats/components/PerformanceIssuesCard';
import { SystemHealthCard } from '@/modules/stats/components/SystemHealthCard';
import { ResourceIntensiveTable } from '@/modules/stats/components/ResourceIntensiveTable';
import { SlowestQueriesTable } from '@/modules/stats/components/SlowestQueriesTable';
import { readFileSync } from 'fs';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const StatsPage = async () => {
  const stats = JSON.parse(readFileSync('/app/stats.json', 'utf-8')) as Stats;

  const queryAnalysis = stats.top_queries.reduce(
    (analysisByIntent, query) => {
      const intent = getQueryIntent(query.query);
      if (!analysisByIntent[intent])
        analysisByIntent[intent] = { count: 0, totalRows: 0 };
      analysisByIntent[intent].count++;
      analysisByIntent[intent].totalRows += query.rows_read;
      return analysisByIntent;
    },
    {} as Record<string, QueryAnalysis>,
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
};

export default StatsPage;
