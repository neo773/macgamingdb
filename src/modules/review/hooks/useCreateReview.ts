'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/modules/trpc/trpc';
import { toast } from 'sonner';
import { triggerConfettiSideCannons } from '@/modules/review/utils/triggerConfettiSideCannons';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';
import { useFormPreferences } from '@/modules/review/hooks/useFormPreferences';
import {
  type PlayMethod,
  type TranslationLayer,
  PlayMethodEnum,
  TranslationLayerEnum,
  PerformanceEnum,
  GraphicsSettingsEnum,
  SOFTWARE_VERSIONS,
} from 'macgamingdb-server/schema';
import { type ReviewFormData } from '../types/ReviewFormData';

interface MacConfig {
  identifier: string;
  metadata: {
    family: string;
    chip: string;
    chipVariant: string;
    year: number;
    cpuCores: number;
    gpuCores: number;
    ram: number;
  };
}

interface UseCreateReviewOptions {
  gameId: string;
  onOpenChange: (open: boolean) => void;
}

const defaultSoftwareVersion = (playMethod: PlayMethod): string => {
  if (playMethod === 'CROSSOVER') return SOFTWARE_VERSIONS.CROSSOVER[0];
  if (playMethod === 'PARALLELS') return SOFTWARE_VERSIONS.PARALLELS[0];
  return '';
};

export const useCreateReview = ({
  gameId,
  onOpenChange,
}: UseCreateReviewOptions) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [customVersion, setCustomVersion] = useState(false);
  const [customVersionValue, setCustomVersionValue] = useState('');
  const [currentScreen, setCurrentScreen] = useState<'form' | 'mac-selection'>(
    'form',
  );
  const [userSelectedConfig, setUserSelectedConfig] =
    useState<MacConfig | null>(null);

  const { getPreferences, updatePreference } = useFormPreferences();
  const preferences = getPreferences();

  const initialPlayMethod = preferences.playMethod ?? PlayMethodEnum.options[1];

  const [formData, setFormData] = useState<ReviewFormData>({
    fps: '',
    resolution: '',
    notes: '',
    screenshots: [],
    softwareVersion: defaultSoftwareVersion(initialPlayMethod),
    playMethod: initialPlayMethod,
    translationLayer:
      preferences.translationLayer ?? TranslationLayerEnum.options[0],
    performance: PerformanceEnum.options[1],
    graphicsSettings: GraphicsSettingsEnum.options[1],
    macConfigIdentifier: preferences.macConfigIdentifier || '',
  });

  const { data: savedMacConfig } = trpc.review.getMacConfigById.useQuery(
    { identifier: preferences.macConfigIdentifier! },
    {
      enabled: !!preferences.macConfigIdentifier,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  );

  const selectedConfig = userSelectedConfig ?? savedMacConfig ?? null;

  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      triggerConfettiSideCannons();
      trackEvent({ name: 'review-submitted', data: { gameId } });

      setTimeout(() => {
        onOpenChange(false);
        router.refresh();
      }, 2000);
    },
    onError: (error) => {
      setError('Error submitting review. Please try again.');
      console.error(error);
    },
  });

  const isSubmitting = createReviewMutation.isPending;

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((previousFormData) => ({ ...previousFormData, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((previousFormData) => ({ ...previousFormData, [name]: value }));
  };

  const handlePlayMethodSelect = (method: PlayMethod) => {
    setFormData((previousFormData) => ({
      ...previousFormData,
      playMethod: method,
      softwareVersion: defaultSoftwareVersion(method),
    }));
    updatePreference('playMethod', method);
  };

  const handleTranslationLayerChange = (value: string) => {
    handleSelectChange('translationLayer', value);
    updatePreference('translationLayer', value as TranslationLayer);
  };

  const handleMacConfigSelect = (config: MacConfig) => {
    setUserSelectedConfig(config);
    setFormData((previousFormData) => ({
      ...previousFormData,
      macConfigIdentifier: config.identifier,
    }));
    updatePreference('macConfigIdentifier', config.identifier);
    setCurrentScreen('form');
  };

  const handleScreenshotsChange = (screenshots: string[]) => {
    setFormData((previousFormData) => ({ ...previousFormData, screenshots }));
  };

  const handleSoftwareVersionChange = (value: string) => {
    if (value === 'custom') {
      setCustomVersion(true);
    } else {
      handleSelectChange('softwareVersion', value);
    }
  };

  const handleCustomVersionCancel = () => {
    setCustomVersion(false);
    setCustomVersionValue('');
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    if (
      !formData.playMethod ||
      !formData.performance ||
      !formData.macConfigIdentifier
    ) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);

    const finalSoftwareVersion = customVersion
      ? customVersionValue
      : formData.softwareVersion;

    try {
      await createReviewMutation.mutateAsync({
        gameId: gameId as string,
        playMethod: formData.playMethod,
        translationLayer:
          formData.playMethod === 'CROSSOVER'
            ? formData.translationLayer
            : null,
        performance: formData.performance,
        fps: formData.fps ? parseInt(formData.fps) : null,
        graphicsSettings: formData.graphicsSettings,
        resolution: formData.resolution,
        macConfigIdentifier: formData.macConfigIdentifier,
        notes: formData.notes,
        screenshots: formData.screenshots,
        softwareVersion: finalSoftwareVersion,
      });

      toast('Your review has been submitted successfully!');
    } catch (error) {
      setError('Error submitting review. Please try again.');
      console.error(error);
    }
  };

  return {
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
  };
};
