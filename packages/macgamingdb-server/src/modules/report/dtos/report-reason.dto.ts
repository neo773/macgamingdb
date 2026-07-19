import { z } from 'zod';

export const ReportReasonSchema = z.enum([
  'spam',
  'offensive',
  'off_topic',
  'fake',
  'other',
]);

export type ReportReason = z.infer<typeof ReportReasonSchema>;
