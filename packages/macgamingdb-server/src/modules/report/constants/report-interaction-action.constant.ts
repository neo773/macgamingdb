export const REPORT_INTERACTION_ACTION = {
  REMOVE: 'report_remove',
  KEEP: 'report_keep',
} as const;

export type ReportInteractionAction =
  (typeof REPORT_INTERACTION_ACTION)[keyof typeof REPORT_INTERACTION_ACTION];
