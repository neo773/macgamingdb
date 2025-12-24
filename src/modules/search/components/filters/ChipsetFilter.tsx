import React from 'react';
import { SelectFilter } from '@/components/ui/select-filter';

interface ChipsetOption {
  value: string;
  label: string;
  count?: number;
}

interface ChipsetFilterProps {
  selectedChipset: string;
  chipsetOptions: ChipsetOption[];
  onChipsetChange: (value: string) => void;
  className?: string;
}

export const ChipsetFilter: React.FC<ChipsetFilterProps> = ({
  selectedChipset,
  chipsetOptions,
  onChipsetChange,
  className = '',
}) => {
  return (
    <SelectFilter
      value={selectedChipset}
      onValueChange={onChipsetChange}
      options={chipsetOptions}
      placeholder="All Chipsets"
      className={className}
      minWidth="150px"
    />
  );
};
