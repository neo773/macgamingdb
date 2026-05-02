'use client';

import { type PerformanceFilter, type PlayMethodFilter } from '@/lib/constants';
import { ChipsetFilter as ChipsetFilterComponent } from '@/modules/search/components/filters/ChipsetFilter';
import { PlayMethodFilter as PlayMethodFilterComponent } from '@/modules/search/components/filters/PlayMethodFilter';
import { PerformanceFilter as PerformanceFilterComponent } from '@/modules/search/components/filters/PerformanceFilter';
import { formatRatingLabel } from '@macgamingdb/server/utils/formatRatingLabel';
import type { ChipsetGroup } from '@macgamingdb/server/utils/getChipsetCombinations';

interface HomeFiltersProps {
  chipsetFilter: string;
  playMethodFilter: PlayMethodFilter;
  performanceFilter: PerformanceFilter;
  chipsetGroups: ChipsetGroup[];
  playMethodOptions: { value: string; label: string }[];
  ratingCounts?: Record<string, number>;
  onChipsetChange: (value: string) => void;
  onPlayMethodChange: (value: string) => void;
  onPerformanceChange: (filter: PerformanceFilter) => void;
}

export function HomeFilters({
  chipsetFilter,
  playMethodFilter,
  performanceFilter,
  chipsetGroups,
  playMethodOptions,
  ratingCounts,
  onChipsetChange,
  onPlayMethodChange,
  onPerformanceChange,
}: HomeFiltersProps) {
  return (
    <div className="mb-6">
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max">
          <ChipsetFilterComponent
            selectedChipset={chipsetFilter}
            chipsetGroups={chipsetGroups}
            onChipsetChange={onChipsetChange}
          />

          <PlayMethodFilterComponent
            selectedPlayMethod={playMethodFilter}
            playMethodOptions={playMethodOptions}
            onPlayMethodChange={onPlayMethodChange}
          />

          <PerformanceFilterComponent
            activeFilter={performanceFilter}
            onFilterChange={onPerformanceChange}
            displayStats={ratingCounts}
            formatRatingLabel={formatRatingLabel}
          />
        </div>
      </div>
    </div>
  );
}
