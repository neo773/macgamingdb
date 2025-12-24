'use client';

import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import GameReviewCard from '@/modules/review/components/ReviewCard';
import ExpandableReviewNote from '@/modules/review/components/ExpandableReviewNote';
import ScreenshotDisplay from '@/modules/review/components/ScreenshotDisplay';
import { type SteamAppData } from '@macgamingdb/server/api/steam';
import { type Game, type GameReview } from '@macgamingdb/server/generated/prisma/client';

type ReviewWithGame = GameReview & { game: Game };

interface ReviewItemProps {
  review: ReviewWithGame;
  editMode: boolean;
  isFocused: boolean;
  editableNote: string;
  hasUnsavedChanges: boolean;
  onDelete: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onNoteChange: (value: string) => void;
  onSave: () => void;
}

export function ReviewItem({
  review,
  editMode,
  isFocused,
  editableNote,
  hasUnsavedChanges,
  onDelete,
  onFocus,
  onBlur,
  onNoteChange,
  onSave,
}: ReviewItemProps) {
  const gameDetails = JSON.parse(review.game.details ?? '{}') as SteamAppData;

  return (
    <div
      className={`${editMode && !isFocused ? 'animate-wiggle' : ''}`}
      style={{
        animation: editMode && !isFocused ? 'wiggle 0.5s infinite ease-in-out' : 'none',
      }}
    >
      {editMode && (
        <button
          onClick={onDelete}
          className="absolute -top-2.5 -right-2.5 z-40 bg-destructive rounded-full p-1.5 shadow-md"
          aria-label="Delete review"
        >
          <X size={16} className="text-white" />
        </button>
      )}
      <GameReviewCard
        review={review}
        className="pt-0"
        header={
          <div className="aspect-[460/215] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
            <img
              src={`${gameDetails.header_image}`}
              alt={review.game.id}
              className="w-full h-full object-none"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <Link href={`/games/${review.gameId}`}></Link>
              <div className="text-sm text-gray-300 mt-1">
                Reviewed{' '}
                {formatDistance(new Date(review.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        }
        customReviewNote={
          <>
            {review.notes && (
              <div className="border-t border-white/15 pt-3 mt-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2 flex justify-between items-center">
                    Review Note:
                    {editMode && hasUnsavedChanges && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSave}
                        className="text-white hover:text-blue-300 p-1"
                      >
                        <Save size={14} />
                      </Button>
                    )}
                  </h4>
                  {editMode ? (
                    <Textarea
                      value={editableNote}
                      onChange={(e) => onNoteChange(e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      className="bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 caret-blue-500 ring ring-blue-500"
                      placeholder="Add your thoughts about this game..."
                    />
                  ) : (
                    <ExpandableReviewNote
                      notes={review.notes}
                      screenshots={
                        review.screenshots ? JSON.parse(review.screenshots) : undefined
                      }
                    />
                  )}
                </div>
              </div>
            )}
            {review.notes === null &&
              review.screenshots &&
              review.screenshots.length > 0 && (
                <div className="border-t border-white/15 pt-3 mt-2">
                  <h4 className="text-sm font-medium text-gray-300">Screenshots:</h4>
                  <ScreenshotDisplay
                    screenshots={
                      review.screenshots ? JSON.parse(review.screenshots) : undefined
                    }
                  />
                </div>
              )}
          </>
        }
      />
    </div>
  );
}
