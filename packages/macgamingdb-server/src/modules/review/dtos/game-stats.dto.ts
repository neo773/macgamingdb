import { z } from 'zod';

export const GameStatsSchema = z.object({
  totalReviews: z.number(),
  methods: z.object({
    native: z.number(),
    crossover: z.number(),
    parallels: z.number(),
    other: z.number(),
  }),
  averagePerformance: z.number(),
  translationLayers: z.record(
    z.string(),
    z.object({ count: z.number(), averagePerformance: z.number() }),
  ),
});
