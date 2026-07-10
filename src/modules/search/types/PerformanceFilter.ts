import { type z } from 'zod';
import { type PerformanceEnum } from 'macgamingdb-server/schema';

export type PerformanceFilter = 'ALL' | z.infer<typeof PerformanceEnum>;
