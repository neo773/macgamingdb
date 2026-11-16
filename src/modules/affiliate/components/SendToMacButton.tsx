'use client';

import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from 'macgamingdb-ui/input/Button';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';
import { CROSSOVER_TRIAL_URL } from '@/modules/affiliate/constants/CROSSOVER_TRIAL_URL';

type SendToMacButtonProps = {
  gameId: string;
  gameName: string;
};

const isShareCancellation = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

const copyTrialLink = async () => {
  try {
    await navigator.clipboard.writeText(CROSSOVER_TRIAL_URL);
    toast('Link copied. Open it on your Mac to start the free trial.');
  } catch (error) {
    console.error('Failed to copy CrossOver trial link', error);
    toast(`Couldn't copy. Visit ${CROSSOVER_TRIAL_URL} on your Mac.`);
  }
};

export const SendToMacButton = ({ gameId, gameName }: SendToMacButtonProps) => {
  const handleSend = async () => {
    trackEvent({
      name: 'crossover-click',
      data: { gameId, action: 'send-to-mac' },
    });

    if (typeof navigator.share !== 'function') {
      await copyTrialLink();
      return;
    }

    try {
      await navigator.share({
        title: 'CrossOver free trial',
        text: `Try CrossOver free to play ${gameName} on your Mac.`,
        url: CROSSOVER_TRIAL_URL,
      });
    } catch (error) {
      if (isShareCancellation(error)) {
        return;
      }
      await copyTrialLink();
    }
  };

  return (
    <Button size="lg" className="w-full sm:w-auto" onClick={handleSend}>
      <Send />
      Send to my Mac
    </Button>
  );
};
