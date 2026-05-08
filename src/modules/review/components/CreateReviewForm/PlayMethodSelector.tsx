'use client';

import { type PlayMethod, PlayMethodEnum } from '@macgamingdb/server/schema';

interface PlayMethodSelectorProps {
  selectedMethod: PlayMethod;
  onSelect: (method: PlayMethod) => void;
}

const PLAY_METHOD_LABELS: Record<PlayMethod, string> = {
  NATIVE: 'Native',
  CROSSOVER: 'CrossOver',
  PARALLELS: 'Parallels',
};

export function PlayMethodSelector({ selectedMethod, onSelect }: PlayMethodSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby="play-method-label"
      className="space-y-2"
    >
      <div id="play-method-label" className="block text-sm font-medium">
        Play Method
      </div>
      <div className="flex gap-4 justify-between">
        {PlayMethodEnum.options.map((method) => (
          <button
            key={method}
            type="button"
            role="radio"
            aria-checked={selectedMethod === method}
            onClick={() => onSelect(method)}
            className={`cursor-pointer flex flex-col items-center bg-transparent border-0 p-0 ${
              selectedMethod === method
                ? 'text-blue-500 font-medium'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <div
              className={`relative p-1 rounded-xl ${
                selectedMethod === method ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={`/images/${method.toLowerCase()}.png`}
                alt={method}
                className="size-14 object-contain p-1"
              />
            </div>
            <span className="mt-1 text-sm">{PLAY_METHOD_LABELS[method]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
