import { type TopQueriesItem } from '@/modules/stats/types/TopQueriesItem';
import { type SlowestQueriesItem } from '@/modules/stats/types/SlowestQueriesItem';

export type Stats = {
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
};
