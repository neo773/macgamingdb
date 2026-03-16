'use client';

import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';
import GameReviewCard from '@/modules/review/components/ReviewCard';
import ExpandableReviewNote from '@/modules/review/components/ExpandableReviewNote';
import ScreenshotDisplay from '@/modules/review/components/ScreenshotDisplay';
import { type SteamAppData } from '@macgamingdb/server/api/steam';
import {
  GraphicsSettingsEnum,
  type GraphicsSettings,
  type Performance,
  PerformanceEnum,
  SOFTWARE_VERSIONS,
  type TranslationLayer,
  TranslationLayerEnum,
} from '@macgamingdb/server/schema';
import { type Game, type GameReview } from '@macgamingdb/server/drizzle/types';
import { transformPerformanceRating } from '../../utils';

type ReviewWithGame = GameReview & { game: Game };

interface ReviewItemProps {
  review: ReviewWithGame;
  editMode: boolean;
  isFocused: boolean;
  editableNote: string;
  editableSoftwareVersion: string;
  editableTranslationLayer: TranslationLayer;
  editablePerformance: Performance;
  editableGraphicsSettings: GraphicsSettings;
  editableFps: string;
  editableResolution: string;
  hasUnsavedChanges: boolean;
  onDelete: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onNoteChange: (value: string) => void;
  onSoftwareVersionChange: (value: string) => void;
  onTranslationLayerChange: (value: TranslationLayer) => void;
  onPerformanceChange: (value: Performance) => void;
  onGraphicsSettingsChange: (value: GraphicsSettings) => void;
  onFpsChange: (value: string) => void;
  onResolutionChange: (value: string) => void;
  onSave: () => void;
}

const TRANSLATION_LAYER_LABELS: Record<string, string> = {
  DXVK: 'DXVK',
  DXMT: 'DXMT',
  D3D_METAL: 'D3D Metal',
  NONE: 'None / Default',
};

const GRAPHICS_LABELS: Record<string, string> = {
  ULTRA: 'Ultra',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export function ReviewItem({
  review,
  editMode,
  isFocused,
  editableNote,
  editableSoftwareVersion,
  editableTranslationLayer,
  editablePerformance,
  editableGraphicsSettings,
  editableFps,
  editableResolution,
  hasUnsavedChanges,
  onDelete,
  onFocus,
  onBlur,
  onNoteChange,
  onSoftwareVersionChange,
  onTranslationLayerChange,
  onPerformanceChange,
  onGraphicsSettingsChange,
  onFpsChange,
  onResolutionChange,
  onSave,
}: ReviewItemProps) {
  const gameDetails = JSON.parse(review.game.details ?? '{}') as SteamAppData;
  const hasVersionSelection =
    review.playMethod === 'CROSSOVER' || review.playMethod === 'PARALLELS';
  const softwareVersionOptions =
    review.playMethod === 'CROSSOVER'
      ? SOFTWARE_VERSIONS.CROSSOVER
      : review.playMethod === 'PARALLELS'
        ? SOFTWARE_VERSIONS.PARALLELS
        : [];
  const selectedSoftwareVersion = editableSoftwareVersion || '__none__';
  const hasCustomVersion =
    !!editableSoftwareVersion && !softwareVersionOptions.includes(editableSoftwareVersion);

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
            {editMode && (
              <div className="border-t border-white/15 pt-3 mt-2">
                {hasVersionSelection && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Software Version:
                    </h4>
                    <Select
                      value={selectedSoftwareVersion}
                      onValueChange={(value) =>
                        onSoftwareVersionChange(value === '__none__' ? '' : value)
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
                        {hasCustomVersion && (
                          <SelectItem value={editableSoftwareVersion}>
                            {editableSoftwareVersion}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {review.playMethod === 'CROSSOVER' && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Translation Layer:
                    </h4>
                    <Select
                      value={editableTranslationLayer}
                      onValueChange={(value) =>
                        onTranslationLayerChange(value as TranslationLayer)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select translation layer" />
                      </SelectTrigger>
                      <SelectContent>
                        {TranslationLayerEnum.options.map((layer) => (
                          <SelectItem key={layer} value={layer}>
                            {TRANSLATION_LAYER_LABELS[layer] || layer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">
                      Performance Rating:
                    </h4>
                    <Select
                      value={editablePerformance}
                      onValueChange={(value) => onPerformanceChange(value as Performance)}
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
                      Graphics Settings:
                    </h4>
                    <Select
                      value={editableGraphicsSettings}
                      onValueChange={(value) =>
                        onGraphicsSettingsChange(value as GraphicsSettings)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select graphics settings" />
                      </SelectTrigger>
                      <SelectContent>
                        {GraphicsSettingsEnum.options.map((setting) => (
                          <SelectItem key={setting} value={setting}>
                            {GRAPHICS_LABELS[setting] || setting}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">FPS:</h4>
                    <Input
                      type="number"
                      value={editableFps}
                      onChange={(e) => onFpsChange(e.target.value)}
                      placeholder="e.g. 60"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Resolution:</h4>
                    <Input
                      type="text"
                      value={editableResolution}
                      onChange={(e) => onResolutionChange(e.target.value)}
                      placeholder="e.g. 1920x1080"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Review Note:</h4>
                  <Textarea
                    value={editableNote}
                    onChange={(e) => onNoteChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    className="bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 caret-blue-500 ring ring-blue-500"
                    placeholder="Add your thoughts about this game..."
                  />

                  {hasUnsavedChanges && (
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSave}
                        className="text-white hover:text-blue-300 p-1"
                      >
                        <Save size={14} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!editMode && review.notes && (
              <div className="border-t border-white/15 pt-3 mt-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Review Note:</h4>
                <ExpandableReviewNote
                  notes={review.notes}
                  screenshots={review.screenshots ? JSON.parse(review.screenshots) : undefined}
                />
              </div>
            )}

            {review.notes === null &&
              !editMode &&
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
