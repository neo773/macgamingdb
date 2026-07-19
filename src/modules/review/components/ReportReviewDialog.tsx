'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from 'macgamingdb-ui/input/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from 'macgamingdb-ui/feedback/Tooltip';
import { Textarea } from 'macgamingdb-ui/input/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'macgamingdb-ui/input/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'macgamingdb-ui/feedback/Dialog';
import {
  REPORT_REASONS,
  isReportReason,
  useReportReview,
  type ReportReason,
} from '../hooks/useReportReview';

const NOTE_MAX_LENGTH = 500;

export const ReportReviewDialog = ({ reviewId }: { reviewId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | undefined>(undefined);
  const [note, setNote] = useState('');
  const { submitReport, isSubmitting } = useReportReview({
    onReported: () => setIsOpen(false),
  });

  const handleReasonChange = (value: string) => {
    if (isReportReason(value)) {
      setReason(value);
    }
  };

  const handleSubmit = async () => {
    await submitReport({
      reviewId,
      reason,
      note: note.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label="Report review"
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <Flag size={16} />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Report review</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this review</DialogTitle>
          <DialogDescription>
            Tell us what looks wrong and a moderator will take a look.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Select value={reason} onValueChange={handleReasonChange}>
            <SelectTrigger>
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((reportReason) => (
                <SelectItem key={reportReason.value} value={reportReason.value}>
                  {reportReason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add details (optional)"
            maxLength={NOTE_MAX_LENGTH}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Reporting…' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
