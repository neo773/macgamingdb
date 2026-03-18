'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type inferRouterInputs } from '@trpc/server';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';
import { type AppRouter } from '@macgamingdb/server/routers/_app';
import { type Game, type GameReview } from '@macgamingdb/server/drizzle/types';

type ReviewWithGame = GameReview & { game: Game };

type UpdateReviewInput = inferRouterInputs<AppRouter>['review']['updateReview'];

type ReviewDraft = Omit<UpdateReviewInput, 'reviewId' | 'screenshots'>;

const EDITABLE_REVIEW_FIELDS: readonly (keyof ReviewDraft)[] = [
  'notes',
  'performance',
  'fps',
  'resolution',
  'softwareVersion',
];

function draftMatchesOriginal(
  draft: ReviewDraft,
  original: ReviewDraft,
): boolean {
  return EDITABLE_REVIEW_FIELDS.every(
    (field) => draft[field] === original[field],
  );
}

export function useReviewDraft(review: ReviewWithGame) {
  const router = useRouter();

  const originalDraft: ReviewDraft = {
    notes: review?.notes ?? '',
    performance: review?.performance,
    fps: review?.fps,
    resolution: review?.resolution,
    softwareVersion: review?.softwareVersion,
  };

  const [draft, setDraft] = useState<ReviewDraft>(originalDraft);

  const saveMutation = trpc.review.updateReview.useMutation({
    onSuccess: () => {
      router.refresh();
      toast('Review updated');
    },
    onError: () => {
      toast.error('Failed to update review');
    },
  });

  const updateDraftField = <K extends keyof ReviewDraft>(
    field: K,
    value: ReviewDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const hasUnsavedChanges = !draftMatchesOriginal(draft, originalDraft);

  const saveChanges = () => {
    saveMutation.mutate({
      reviewId: review.id,
      ...draft,
    });
  };

  return { draft, updateDraftField, hasUnsavedChanges, saveChanges, isSaving: saveMutation.isPending };
}
