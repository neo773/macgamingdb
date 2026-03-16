'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/provider';
import { toast } from 'sonner';
import { type Game, type GameReview } from '@macgamingdb/server/drizzle/types';
import {
  GraphicsSettingsEnum,
  type GraphicsSettings,
  type Performance,
  type TranslationLayer,
} from '@macgamingdb/server/schema';

type ReviewWithGame = GameReview & { game: Game };

interface EditableReviewFields {
  notes: string;
  softwareVersion: string;
  translationLayer: TranslationLayer;
  performance: Performance;
  graphicsSettings: GraphicsSettings;
  fps: string;
  resolution: string;
}

export function useMyReviews(userReviews: ReviewWithGame[]) {
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [editableReviews, setEditableReviews] = useState<
    Record<string, EditableReviewFields>
  >({});
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
          acc[review.id] = {
            notes: review.notes || '',
            softwareVersion: review.softwareVersion || '',
            translationLayer: (review.translationLayer || 'NONE') as TranslationLayer,
            performance: review.performance,
            graphicsSettings:
              (review.graphicsSettings as GraphicsSettings) ||
              GraphicsSettingsEnum.options[1],
            fps: review.fps?.toString() || '',
            resolution: review.resolution || '',
          };
          return acc;
        },
        {} as Record<string, EditableReviewFields>
      );

      setEditableReviews(initialEdits);
    }

    setEditMode(!editMode);
  };

  const handleUpdateReview = (reviewId: string) => {
    const reviewData = editableReviews[reviewId];

    updateReviewMutation.mutate({
      reviewId,
      notes: reviewData.notes,
      softwareVersion: reviewData.softwareVersion || null,
      translationLayer: reviewData.translationLayer,
      performance: reviewData.performance,
      graphicsSettings: reviewData.graphicsSettings,
      fps: reviewData.fps ? parseInt(reviewData.fps, 10) : null,
      resolution: reviewData.resolution.trim() ? reviewData.resolution : null,
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
      [reviewId]: {
        ...prev[reviewId],
        notes: value,
      },
    }));
  };

  const handleSoftwareVersionChange = (reviewId: string, value: string) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        softwareVersion: value,
      },
    }));
  };

  const handleTranslationLayerChange = (reviewId: string, value: TranslationLayer) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        translationLayer: value,
      },
    }));
  };

  const handlePerformanceChange = (reviewId: string, value: Performance) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        performance: value,
      },
    }));
  };

  const handleGraphicsSettingsChange = (reviewId: string, value: GraphicsSettings) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        graphicsSettings: value,
      },
    }));
  };

  const handleFpsChange = (reviewId: string, value: string) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        fps: value,
      },
    }));
  };

  const handleResolutionChange = (reviewId: string, value: string) => {
    setEditableReviews((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        resolution: value,
      },
    }));
  };

  const hasUnsavedChanges = (
    reviewId: string,
    originalNotes: string | null,
    originalSoftwareVersion: string | null,
    originalTranslationLayer: string | null,
    originalPerformance: string,
    originalGraphicsSettings: string | null,
    originalFps: number | null,
    originalResolution: string | null,
  ) => {
    const current = editableReviews[reviewId];

    const notesChanged = current.notes !== (originalNotes || '');
    const softwareVersionChanged =
      current.softwareVersion !== (originalSoftwareVersion || '');
    const translationLayerChanged =
      current.translationLayer !== (originalTranslationLayer || 'NONE');
    const performanceChanged = current.performance !== originalPerformance;
    const graphicsSettingsChanged =
      current.graphicsSettings !==
      ((originalGraphicsSettings as GraphicsSettings) || GraphicsSettingsEnum.options[1]);
    const fpsChanged = current.fps !== (originalFps?.toString() || '');
    const resolutionChanged = current.resolution !== (originalResolution || '');

    return (
      notesChanged ||
      softwareVersionChanged ||
      translationLayerChanged ||
      performanceChanged ||
      graphicsSettingsChanged ||
      fpsChanged ||
      resolutionChanged
    );
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
    handleSoftwareVersionChange,
    handleTranslationLayerChange,
    handlePerformanceChange,
    handleGraphicsSettingsChange,
    handleFpsChange,
    handleResolutionChange,
    hasUnsavedChanges,
  };
}
