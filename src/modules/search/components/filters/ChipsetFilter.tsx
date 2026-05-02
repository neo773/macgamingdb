import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DEFAULT_CHIPSET_FILTER } from '@/lib/constants';
import type { ChipsetGroup } from '@macgamingdb/server/utils/getChipsetCombinations';

const ALL_CHIPSETS_LABEL = 'All Chipsets';

interface ChipsetFilterProps {
  selectedChipset: string;
  chipsetGroups: ChipsetGroup[];
  onChipsetChange: (value: string) => void;
  className?: string;
}

const findLabel = (value: string, groups: ChipsetGroup[]): string =>
  groups
    .flatMap((groups) => groups.variants)
    .find((variant) => variant.value === value)?.label ?? ALL_CHIPSETS_LABEL;

export const ChipsetFilter: React.FC<ChipsetFilterProps> = ({
  selectedChipset,
  chipsetGroups,
  onChipsetChange,
  className = '',
}) => {
  const triggerLabel =
    selectedChipset === DEFAULT_CHIPSET_FILTER
      ? ALL_CHIPSETS_LABEL
      : findLabel(selectedChipset, chipsetGroups);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`min-w-[150px] justify-between rounded-xl border-2 ${className}`}
        >
          {triggerLabel}
          <ChevronDown className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-[#171717e0] backdrop-blur-md"
      >
        <DropdownMenuItem
          className="focus:bg-white/90 focus:text-black"
          onSelect={() => onChipsetChange(DEFAULT_CHIPSET_FILTER)}
        >
          {ALL_CHIPSETS_LABEL}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {chipsetGroups.map((group) => (
          <DropdownMenuSub key={group.chipset}>
            <DropdownMenuSubTrigger className="focus:bg-white/90 focus:text-black data-[state=open]:bg-white/90 data-[state=open]:text-black">
              {group.chipset}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="bg-[#171717e0] backdrop-blur-md">
                {group.variants.map((variant) => (
                  <DropdownMenuItem
                    key={variant.value}
                    className="focus:bg-white/90 focus:text-black"
                    onSelect={() => onChipsetChange(variant.value)}
                  >
                    {variant.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
