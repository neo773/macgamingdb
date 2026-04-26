'use client';

import { Store, KeyRound, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/provider';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'CA$', AUD: 'A$',
  BRL: 'R$', PLN: 'zł', RUB: '₽', TRY: '₺', INR: '₹', CNY: '¥',
  KRW: '₩', CHF: 'CHF', SEK: 'kr', NOK: 'kr', DKK: 'kr', MXN: 'MX$',
};

function currencySymbol(code: string) {
  return CURRENCY_SYMBOLS[code] ?? code + ' ';
}

interface PriceDisplayProps {
  gameId: string;
  compact?: boolean;
}

export function PriceDisplay({ gameId, compact }: PriceDisplayProps) {
  const { data: priceData } = trpc.game.getPrices.useQuery({ gameId });

  if (!priceData) return null;

  const { currentRetail, currentKeyshops, historicalRetail, historicalKeyshops, currency } =
    priceData.prices;

  if (!currentRetail && !currentKeyshops && !historicalRetail) return null;

  const symbol = currencySymbol(currency);
  const fmt = (v: string) => `${symbol}${v}`;
  const bestCurrent = currentRetail ?? currentKeyshops;
  const bestHistorical = historicalRetail ?? historicalKeyshops;

  if (compact) {
    if (!bestCurrent) return null;
    return (
      <span className="inline-flex items-center rounded-full bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] text-green-400 border border-gray-700/50 font-mono font-semibold">
        {fmt(bestCurrent)}
      </span>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-white font-semibold">Pricing</h1>
        <a
          href={priceData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-400 hover:border-white/20 hover:bg-white/10 hover:text-gray-300 transition-all"
        >
          <img
            src="https://gg.deals/images/logo/logo-white.svg?v=c4392aa2"
            alt="gg.deals"
            className="h-3.5 opacity-70"
          />
          <span className="text-xs">↗</span>
        </a>
      </div>
      <Card className="shadow-lg mb-8 mt-4 bg-primary-gradient">
        <CardContent>
          <div className="space-y-3">
            {currentRetail && (
              <div className="flex justify-between text-gray-300">
                <span className="flex items-center gap-2">
                  <Store className="size-3.5 text-gray-500" />
                  Official Stores
                </span>
                <span className="font-medium text-white">{fmt(currentRetail)}</span>
              </div>
            )}

            {currentKeyshops && (
              <div className="flex justify-between text-gray-300">
                <span className="flex items-center gap-2">
                  <KeyRound className="size-3.5 text-gray-500" />
                  Keyshops
                </span>
                <span className="font-medium text-white">{fmt(currentKeyshops)}</span>
              </div>
            )}

            {bestHistorical && (
              <div className="flex justify-between text-gray-300 pt-3 border-t border-white/10">
                <span className="flex items-center gap-2">
                  <TrendingDown className="size-3.5 text-gray-500" />
                  Historical Low
                </span>
                <span className="font-medium text-white">{fmt(bestHistorical)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
