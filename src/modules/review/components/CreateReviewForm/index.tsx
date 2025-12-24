'use client';

import { motion } from 'motion/react';
import { InfoIcon } from 'lucide-react';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AuthPrompt from '@/modules/auth/components/AuthPrompt';
import ScreenshotUpload from '@/modules/review/components/ScreenshotUpload';
import SelectMacConfiguration, {
  getDeviceIcon,
  getHumanReadableFamily,
} from '@/modules/review/components/SelectMacConfiguration';

import { useCreateReview } from '../../hooks/useCreateReview';
import { type ReviewFormProps } from '../../types';
import { PlayMethodSelector } from './PlayMethodSelector';
import { SoftwareVersionSelect } from './SoftwareVersionSelect';
import { TranslationLayerSelect } from './TranslationLayerSelect';
import { PerformanceFields } from './PerformanceFields';
import { MacConfigButton } from './MacConfigButton';
import { ReviewFormFooter } from './ReviewFormFooter';

export default function CreateReviewForm({
  gameId,
  gameName,
  onOpenChange,
  onClose,
  isDrawer = false,
}: ReviewFormProps) {
  const {
    formData,
    error,
    success,
    isSubmitting,
    customVersion,
    customVersionValue,
    currentScreen,
    selectedConfig,
    setCustomVersionValue,
    setCurrentScreen,
    handleInputChange,
    handleSelectChange,
    handlePlayMethodSelect,
    handleTranslationLayerChange,
    handleMacConfigSelect,
    handleScreenshotsChange,
    handleSoftwareVersionChange,
    handleCustomVersionCancel,
    handleSubmit,
  } = useCreateReview({ gameId, onOpenChange });

  const Header = isDrawer ? 'div' : DialogHeader;
  const Title = isDrawer ? 'h3' : DialogTitle;
  const Description = isDrawer ? 'p' : DialogDescription;

  return (
    <div className="relative overflow-hidden">
      <motion.div
        initial={false}
        animate={{ x: currentScreen === 'form' ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full"
      >
        <>
          <Header
            className={
              isDrawer ? 'grid gap-1.5 p-4 text-center sm:text-left' : undefined
            }
          >
            <Title
              className={
                isDrawer
                  ? 'text-lg font-semibold leading-none tracking-tight'
                  : undefined
              }
            >
              Add Experience for {gameName}
            </Title>
            <Description
              className={isDrawer ? 'text-sm text-muted-foreground' : undefined}
            >
              Share your experience running this game on your Mac.
            </Description>
          </Header>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4">
              {error}
            </div>
          )}

          <AuthPrompt promptMessage="To combat spam, please log in to share your experience with this game." />

          <form onSubmit={handleSubmit} className="space-y-6 px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
              <PlayMethodSelector
                selectedMethod={formData.playMethod}
                onSelect={handlePlayMethodSelect}
              />

              <SoftwareVersionSelect
                playMethod={formData.playMethod}
                softwareVersion={formData.softwareVersion}
                customVersion={customVersion}
                customVersionValue={customVersionValue}
                onVersionChange={handleSoftwareVersionChange}
                onCustomVersionChange={setCustomVersionValue}
                onCustomVersionCancel={handleCustomVersionCancel}
              />

              {formData.playMethod === 'CROSSOVER' && (
                <TranslationLayerSelect
                  value={formData.translationLayer}
                  onChange={handleTranslationLayerChange}
                />
              )}

              <PerformanceFields
                performance={formData.performance}
                fps={formData.fps}
                graphicsSettings={formData.graphicsSettings}
                resolution={formData.resolution}
                onSelectChange={handleSelectChange}
                onInputChange={handleInputChange}
              />

              <MacConfigButton
                selectedConfig={selectedConfig}
                onClick={() => setCurrentScreen('mac-selection')}
                getDeviceIcon={getDeviceIcon}
                getHumanReadableFamily={getHumanReadableFamily}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notes (optional)</label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Share your experience, tips, or any issues you encountered..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-row items-center gap-2">
                <label className="block text-sm font-medium">
                  Screenshots (optional)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent className="text-center">
                      <p>
                        Upload up to 3 screenshots (max 10MB each, PNG/JPG/JPEG){' '}
                        <br />
                        Tip:{' '}
                        <a
                          href="https://tinypng.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          www.tinypng.com
                        </a>{' '}
                        can compress your screenshots without visual loss.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <ScreenshotUpload
                gameId={gameId}
                onScreenshotsChange={handleScreenshotsChange}
                maxFiles={3}
              />
            </div>

            <ReviewFormFooter
              isDrawer={isDrawer}
              isSubmitting={isSubmitting}
              success={success}
              onClose={onClose}
            />
          </form>
        </>
      </motion.div>

      {currentScreen === 'mac-selection' && (
        <SelectMacConfiguration
          selectedConfigIdentifier={formData.macConfigIdentifier}
          onSelect={handleMacConfigSelect}
          onBack={() => setCurrentScreen('form')}
        />
      )}
    </div>
  );
}
