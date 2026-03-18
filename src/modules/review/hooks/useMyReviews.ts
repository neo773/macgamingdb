'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';

export function useMyReviews() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editSessionKey, setEditSessionKey] = useState(0);
  const [pendingDeleteReviewId, setPendingDeleteReviewId] = useState<
    string | null
  >(null);

  const deleteMutation = trpc.review.deleteReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast('Review deleted');
    },
  });

  const enterEditMode = () => {
    setIsEditing(true);
    setEditSessionKey((key) => key + 1);
  };

  const exitEditMode = () => {
    setIsEditing(false);
  };

  const confirmDeleteReview = () => {
    if (!pendingDeleteReviewId) return;
    deleteMutation.mutate({
      reviewId: pendingDeleteReviewId,
      confirmation: true,
    });
    setPendingDeleteReviewId(null);
  };

  return {
    isEditing,
    editSessionKey,
    pendingDeleteReviewId,
    isDeletingReview: deleteMutation.isPending,
    enterEditMode,
    exitEditMode,
    setPendingDeleteReviewId,
    confirmDeleteReview,
  };
}
