'use client';

import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WiggleWrapper } from '@/components/ui/wiggle-wrapper';
import { Save, X } from 'lucide-react';
import { useReviewDraft } from '@/modules/review/hooks';
import GameReviewCard from '@/modules/review/components/ReviewCard';
import ExpandableReviewNote from '@/modules/review/components/ExpandableReviewNote';
import ScreenshotDisplay from '@/modules/review/components/ScreenshotDisplay';
import { type SteamAppData } from '@macgamingdb/server/api/steam';
import {
  PerformanceEnum,
  PlayMethodEnum,
  SOFTWARE_VERSIONS,
  type Performance,
} from '@macgamingdb/server/schema';
import { type Game, type GameReview } from '@macgamingdb/server/drizzle/types';
import { transformPerformanceRating } from '../../utils';

type ReviewWithGame = GameReview & { game: Game };

interface ReviewItemProps {
  review: ReviewWithGame;
  isEditing: boolean;
  onRequestDelete: () => void;
}

export function ReviewItem({
  review,
  isEditing,
  onRequestDelete,
}: ReviewItemProps) {
  const { draft, updateDraftField, hasUnsavedChanges, saveChanges } =
    useReviewDraft(review);

  const hasSoftwareVersion =
    review.playMethod === PlayMethodEnum.enum.CROSSOVER ||
    review.playMethod === PlayMethodEnum.enum.PARALLELS;

  const softwareVersionOptions = hasSoftwareVersion
    ? review.playMethod === PlayMethodEnum.enum.CROSSOVER
      ? SOFTWARE_VERSIONS.CROSSOVER
      : SOFTWARE_VERSIONS.PARALLELS
    : [];

  const gameDetails = JSON.parse(review.game.details ?? '{}') as SteamAppData;
  const screenshots = review.screenshots
    ? (JSON.parse(review.screenshots) as string[])
    : null;

  return (
    <WiggleWrapper enabled={isEditing}>
      {isEditing && (
        <button
          onClick={onRequestDelete}
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
              src={gameDetails.header_image}
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
          isEditing ? (
            <div className="border-t border-white/15 pt-3 mt-2">
              {hasSoftwareVersion && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Software Version:
                  </h4>
                  <Select
                    value={draft.softwareVersion ?? '__none__'}
                    onValueChange={(value) =>
                      updateDraftField(
                        'softwareVersion',
                        value === '__none__' ? null : value,
                      )
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select software version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {softwareVersionOptions.map((version) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Performance Rating:
                  </h4>
                  <Select
                    value={draft.performance}
                    onValueChange={(value) =>
                      updateDraftField('performance', value as Performance)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select performance rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {PerformanceEnum.options.map((rating) => (
                        <SelectItem key={rating} value={rating}>
                          {transformPerformanceRating(rating)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    FPS:
                  </h4>
                  <Input
                    type="number"
                    value={draft.fps ?? ''}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      updateDraftField('fps', isNaN(parsed) ? null : parsed);
                    }}
                    placeholder="e.g. 60"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Resolution:
                  </h4>
                  <Input
                    type="text"
                    value={draft.resolution ?? ''}
                    onChange={(e) =>
                      updateDraftField('resolution', e.target.value || null)
                    }
                    placeholder="e.g. 1920x1080"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Review Note:
                </h4>
                <Textarea
                  value={draft.notes}
                  onChange={(e) => updateDraftField('notes', e.target.value)}
                  className="bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 caret-blue-500 ring ring-blue-500"
                  placeholder="Add your thoughts about this game..."
                />

                {hasUnsavedChanges && (
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveChanges}
                      className="text-white hover:text-blue-300 p-1"
                    >
                      <Save size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {review.notes && (
                <div className="border-t border-white/15 pt-3 mt-2">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Review Note:
                  </h4>
                  <ExpandableReviewNote
                    notes={review.notes}
                    screenshots={screenshots ?? undefined}
                  />
                </div>
              )}

              {!review.notes && screenshots && screenshots.length > 0 && (
                <div className="border-t border-white/15 pt-3 mt-2">
                  <h4 className="text-sm font-medium text-gray-300">
                    Screenshots:
                  </h4>
                  <ScreenshotDisplay screenshots={screenshots} />
                </div>
              )}
            </>
          )
        }
      />
    </WiggleWrapper>
  );
}
