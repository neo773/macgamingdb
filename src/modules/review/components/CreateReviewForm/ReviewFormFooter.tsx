'use client';

import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';

interface ReviewFormFooterProps {
  isDrawer: boolean;
  isSubmitting: boolean;
  success: boolean;
  onClose: () => void;
}

export function ReviewFormFooter({
  isDrawer,
  isSubmitting,
  success,
  onClose,
}: ReviewFormFooterProps) {
  const Footer = isDrawer ? 'div' : DialogFooter;

  if (isDrawer) {
    return (
      <div className="mt-auto flex flex-col gap-2 p-4">
        <Button type="submit" disabled={isSubmitting || success} size="lg" className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        <Button
          variant="secondary"
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={onClose}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Footer>
      <DialogClose asChild>
        <Button variant="secondary" type="button" size="lg" disabled={isSubmitting}>
          Cancel
        </Button>
      </DialogClose>
      <Button type="submit" disabled={isSubmitting || success} size="lg">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </Footer>
  );
}
