import { type ReportReason } from '../dtos/report-reason.dto';

export const REPORT_SUBMITTED_EVENT = 'report.submitted';

export type ReportSubmittedEvent = {
  reviewId: string;
  reporterUserId: string;
  reason?: ReportReason;
};
