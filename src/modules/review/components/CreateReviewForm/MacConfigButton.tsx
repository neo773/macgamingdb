'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface MacConfigButtonProps {
  selectedConfig: {
    metadata: {
      family: string;
      chip: string;
      chipVariant: string;
      year: number;
    };
  } | null;
  onClick: () => void;
  getDeviceIcon: (family: string) => string;
  getHumanReadableFamily: (family: string) => string;
}

export function MacConfigButton({
  selectedConfig,
  onClick,
  getDeviceIcon,
  getHumanReadableFamily,
}: MacConfigButtonProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-row items-center gap-2">
        <label htmlFor="mac-config-button" className="block text-sm font-medium">
          Mac Configuration
        </label>
      </div>
      <Button
        id="mac-config-button"
        type="button"
        variant="outline"
        className="w-full justify-between rounded-md"
        onClick={onClick}
      >
        <span className="truncate">
          {selectedConfig
            ? `${getHumanReadableFamily(selectedConfig.metadata.family)} ${selectedConfig.metadata.chip} ${selectedConfig.metadata.chipVariant === 'BASE' ? '' : selectedConfig.metadata.chipVariant} ${selectedConfig.metadata.year}`
            : 'Select Mac configuration...'}
        </span>
        <div className="flex items-center gap-1">
          {selectedConfig && (
            <img
              src={getDeviceIcon(selectedConfig.metadata.family)}
              alt={`${selectedConfig.metadata.family}`}
              className="w-4 h-auto"
            />
          )}
          <ChevronLeft className="size-4 rotate-180" />
        </div>
      </Button>
    </div>
  );
}
