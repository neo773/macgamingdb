import React from 'react';
import { SelectFilter } from '@/components/ui/select-filter';
import { type PlayMethodFilter as PlayMethodFilterType } from '@/lib/constants';

interface PlayMethodOption {
  value: string;
  label: string;
}

interface PlayMethodFilterProps {
  selectedPlayMethod: PlayMethodFilterType;
  playMethodOptions: PlayMethodOption[];
  onPlayMethodChange: (value: string) => void;
  className?: string;
}

export const PlayMethodFilter: React.FC<PlayMethodFilterProps> = ({
  selectedPlayMethod,
  playMethodOptions,
  onPlayMethodChange,
  className = '',
}) => {
  return (
    <SelectFilter
      value={selectedPlayMethod}
      onValueChange={onPlayMethodChange}
      options={playMethodOptions}
      placeholder="All Methods"
      className={className}
      minWidth="150px"
    />
  );
};
