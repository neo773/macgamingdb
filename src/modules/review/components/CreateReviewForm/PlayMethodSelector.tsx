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
    <div className="space-y-2">
      <label className="block text-sm font-medium">Play Method</label>
      <div className="flex gap-4 justify-between">
        {PlayMethodEnum.options.map((method) => (
          <div
            key={method}
            className={`cursor-pointer flex flex-col items-center ${
              selectedMethod === method
                ? 'text-blue-500 font-medium'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => onSelect(method)}
          >
            <div
              className={`relative p-1 rounded-xl ${
                selectedMethod === method ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <img
                src={`/images/${method.toLowerCase()}.png`}
                alt={method}
                className="w-14 h-14 object-contain p-1"
              />
            </div>
            <span className="mt-1 text-sm">{PLAY_METHOD_LABELS[method]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
