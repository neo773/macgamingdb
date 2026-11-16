'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';
import { CROSSOVER_PROMO_CODE } from '@/modules/affiliate/constants/CROSSOVER_PROMO_CODE';
import { CROSSOVER_DISCOUNT_PERCENT } from '@/modules/affiliate/constants/CROSSOVER_DISCOUNT_PERCENT';

type CrossOverPromoCodeButtonProps = {
  gameId: string;
};

export const CrossOverPromoCodeButton = ({
  gameId,
}: CrossOverPromoCodeButtonProps) => {
  const handleCopy = async () => {
    trackEvent({
      name: 'crossover-click',
      data: { gameId, action: 'copy-code' },
    });
    try {
      await navigator.clipboard.writeText(CROSSOVER_PROMO_CODE);
      toast(
        `Code ${CROSSOVER_PROMO_CODE} copied. Use it at checkout for ${CROSSOVER_DISCOUNT_PERCENT}% off.`,
      );
    } catch (error) {
      console.error('Failed to copy CrossOver promo code', error);
      toast(`Couldn't copy. The code is ${CROSSOVER_PROMO_CODE}.`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy promo code ${CROSSOVER_PROMO_CODE}`}
      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#393939] bg-[#1F1F1F] px-4 text-sm text-gray-300 transition-colors hover:text-white sm:w-auto sm:border-dashed sm:border-white/25 sm:bg-transparent sm:hover:border-white/50"
    >
      <span className="sm:hidden">Copy code</span>
      <span className="font-mono font-semibold tracking-wider text-white">
        {CROSSOVER_PROMO_CODE}
      </span>
      <span>· {CROSSOVER_DISCOUNT_PERCENT}% off</span>
      <Copy className="size-3.5" />
    </button>
  );
};
