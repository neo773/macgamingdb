export type SlowestQueriesItem = {
  elapsed_ms: number;
  query: string;
  rows_written: number;
  rows_read: number;
};
