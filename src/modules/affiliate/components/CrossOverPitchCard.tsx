'use client';

import { ArrowUpRight, Check } from 'lucide-react';
import { Button } from 'macgamingdb-ui/input/Button';
import { trackEvent } from '@/modules/analytics/utils/trackEvent';
import { type CrossOverPitch } from '@/modules/affiliate/types/CrossOverPitch';
import { useIsMacComputer } from '@/modules/affiliate/hooks/useIsMacComputer';
import { CrossOverPromoCodeButton } from '@/modules/affiliate/components/CrossOverPromoCodeButton';
import { SendToMacButton } from '@/modules/affiliate/components/SendToMacButton';
import { CrossOverGamePairIcon } from '@/modules/affiliate/components/CrossOverGamePairIcon';
import { CrossOverProof } from '@/modules/affiliate/components/CrossOverProof';
import { CROSSOVER_TRIAL_URL } from '@/modules/affiliate/constants/CROSSOVER_TRIAL_URL';
import { CROSSOVER_TRIAL_DAYS } from '@/modules/affiliate/constants/CROSSOVER_TRIAL_DAYS';

type CrossOverPitchCardProps = {
  gameId: string;
  gameName: string;
  gameArtworkUrls: string[];
  pitch: CrossOverPitch;
};

const TRIAL_REASSURANCES = [
  'No subscription',
  'No credit card',
  `${CROSSOVER_TRIAL_DAYS} days start when you first open it`,
];

export const CrossOverPitchCard = ({
  gameId,
  gameName,
  gameArtworkUrls,
  pitch,
}: CrossOverPitchCardProps) => {
  const isMacComputer = useIsMacComputer();

  return (
    <section
      aria-label="Play with CrossOver"
      className="rounded-3xl bg-gradient-to-br from-cyan-300/35 via-white/10 to-white/[0.04] p-px"
    >
      <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0b0d0e] p-5 md:p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <div className="relative">
          <div className="grid grid-cols-1 gap-y-1 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-x-4">
            <div className="mb-3 sm:row-span-2 sm:mb-0">
              <CrossOverGamePairIcon gameArtworkUrls={gameArtworkUrls} />
            </div>
            <h2 className="text-lg leading-snug font-semibold text-white sm:self-end">
              Play {gameName} on your Mac
            </h2>
            <div className="sm:self-start">
              <CrossOverProof pitch={pitch} />
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-400 sm:mt-4">
            CrossOver runs Windows games on macOS. No Windows license, no
            virtual machine.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {isMacComputer ? (
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <a
                  href={CROSSOVER_TRIAL_URL}
                  target="_blank"
                  rel="noopener sponsored"
                  onClick={() =>
                    trackEvent({
                      name: 'crossover-click',
                      data: { gameId, action: 'start-trial' },
                    })
                  }
                >
                  Start my free trial
                  <ArrowUpRight />
                </a>
              </Button>
            ) : (
              <SendToMacButton gameId={gameId} gameName={gameName} />
            )}
            <CrossOverPromoCodeButton gameId={gameId} />
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-400 sm:mt-3 sm:gap-y-1">
            {TRIAL_REASSURANCES.map((reassurance) => (
              <li key={reassurance} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-cyan-300/80" />
                {reassurance}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-gray-500">
            *Affiliate link. Supports this site &amp; Mac gaming through
            CodeWeavers&apos; contributions to Wine.
          </p>
        </div>
      </div>
    </section>
  );
};
