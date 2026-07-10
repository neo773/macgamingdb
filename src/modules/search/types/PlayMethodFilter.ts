import { type z } from 'zod';
import { type PlayMethodEnum } from 'macgamingdb-server/schema';

export type PlayMethodFilter = 'ALL' | z.infer<typeof PlayMethodEnum>;
