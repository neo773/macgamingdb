'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { type Game, type GameReview } from '@macgamingdb/server/generated/prisma/client';

import { useMyReviews } from '@/modules/review/hooks';
import { DeleteConfirmDialog, ReviewItem } from '@/modules/review/components/MyReviewsList';

export default function MyReviewsClient({
  userReviews,
}: {
  userReviews: (GameReview & { game: Game })[];
}) {
  const {
    editMode,
    reviewToDelete,
    editableReviews,
    focusedReview,
    isDeleting,
    setReviewToDelete,
    setFocusedReview,
    handleEditModeToggle,
    handleUpdateReview,
    handleDeleteConfirm,
    handleNoteChange,
    hasUnsavedChanges,
  } = useMyReviews(userReviews);

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Home
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Game Reviews</h1>
          {userReviews.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditModeToggle}
              className="text-blue-400 hover:text-blue-300"
            >
              {editMode ? 'Done' : <Edit2 size={18} />}
            </Button>
          )}
        </div>

        {userReviews.length === 0 ? (
          <Card className="bg-primary-gradient">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
              <h2 className="text-xl font-medium text-white">
                You haven't submitted any game reviews yet
              </h2>
              <Link href="/">
                <Button>Browse Games</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                editMode={editMode}
                isFocused={focusedReview === review.id}
                editableNote={editableReviews[review.id] || ''}
                hasUnsavedChanges={hasUnsavedChanges(review.id, review.notes)}
                onDelete={() => setReviewToDelete(review.id)}
                onFocus={() => setFocusedReview(review.id)}
                onBlur={() => setFocusedReview(null)}
                onNoteChange={(value) => handleNoteChange(review.id, value)}
                onSave={() => handleUpdateReview(review.id)}
              />
            ))}
          </div>
        )}

        <DeleteConfirmDialog
          isOpen={!!reviewToDelete}
          isDeleting={isDeleting}
          onClose={() => setReviewToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      </Container>
      <Footer />
    </div>
  );
}
