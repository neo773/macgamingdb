'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';
import { type Game, type GameReview } from '@macgamingdb/server/generated/prisma/client';

type ReviewWithGame = GameReview & { game: Game };

export function useMyReviews(userReviews: ReviewWithGame[]) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [editableReviews, setEditableReviews] = useState<Record<string, string>>({});
  const [focusedReview, setFocusedReview] = useState<string | null>(null);

  const deleteReviewMutation = trpc.review.deleteReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast('Review deleted');
    },
  });

  const updateReviewMutation = trpc.review.updateReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast('Review updated');
    },
  });

  const handleEditModeToggle = () => {
    if (!editMode) {
      const initialEdits = userReviews.reduce(
        (acc, review) => {
          acc[review.id] = review.notes || '';
          return acc;
        },
        {} as Record<string, string>
      );
      setEditableReviews(initialEdits);
    }
    setEditMode(!editMode);
  };

  const handleUpdateReview = (reviewId: string) => {
    updateReviewMutation.mutate({
      reviewId,
      notes: editableReviews[reviewId],
    });
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate({
        reviewId: reviewToDelete,
        confirmation: true,
      });
      setReviewToDelete(null);
    }
  };

  const handleNoteChange = (reviewId: string, value: string) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: value,
    }));
  };

  const hasUnsavedChanges = (reviewId: string, originalNotes: string | null) => {
    return editableReviews[reviewId] !== (originalNotes || '');
  };

  return {
    editMode,
    reviewToDelete,
    editableReviews,
    focusedReview,
    isDeleting: deleteReviewMutation.isPending,
    setReviewToDelete,
    setFocusedReview,
    handleEditModeToggle,
    handleUpdateReview,
    handleDeleteConfirm,
    handleNoteChange,
    hasUnsavedChanges,
  };
}
