import { toast } from 'sonner';
import { trpc } from '@/modules/trpc/trpc';

export const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'offensive', label: 'Offensive content' },
  { value: 'off_topic', label: 'Off-topic' },
  { value: 'fake', label: 'Fake or inaccurate' },
  { value: 'other', label: 'Other' },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]['value'];

export const isReportReason = (value: string): value is ReportReason =>
  REPORT_REASONS.some((reason) => reason.value === value);

type SubmitReportParams = {
  reviewId: string;
  reason?: ReportReason;
  note?: string;
};

export const useReportReview = ({
  onReported,
}: {
  onReported?: () => void;
}) => {
  const reportMutation = trpc.report.create.useMutation({
    onSuccess: () => {
      toast('Thanks — a moderator will review this report.');
      onReported?.();
    },
    onError: (error) => {
      toast('Could not submit the report. Please sign in and try again.');
      console.error(error);
    },
  });

  const submitReport = (params: SubmitReportParams) =>
    reportMutation.mutateAsync(params);

  return { submitReport, isSubmitting: reportMutation.isPending };
};
