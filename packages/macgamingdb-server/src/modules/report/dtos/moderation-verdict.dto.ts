import { z } from 'zod';

export const ModerationVerdictSchema = z.object({
  verdict: z.enum(['flag', 'ok', 'uncertain']),
  category: z.enum(['spam', 'inaccurate', 'other', 'none']),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
});

export type ModerationVerdict = z.infer<typeof ModerationVerdictSchema>;
