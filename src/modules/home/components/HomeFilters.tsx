'use client';

import { type PerformanceFilter } from '@/modules/search/types/PerformanceFilter';
import { type PlayMethodFilter } from '@/modules/search/types/PlayMethodFilter';
import { type GenreFilter } from '@/modules/search/types/GenreFilter';
import { ChipsetFilter as ChipsetFilterComponent } from '@/modules/search/components/filters/ChipsetFilter';
import { PlayMethodFilter as PlayMethodFilterComponent } from '@/modules/search/components/filters/PlayMethodFilter';
import { GenreFilter as GenreFilterComponent } from '@/modules/search/components/filters/GenreFilter';
import { PerformanceFilter as PerformanceFilterComponent } from '@/modules/search/components/filters/PerformanceFilter';
import { formatRatingLabel } from 'macgamingdb-server/modules/review/utils/format-rating-label';
import type { ChipsetGroup } from 'macgamingdb-server/modules/mac-config/utils/get-chipset-combinations';

interface HomeFiltersProps {
  chipsetFilter: string;
  playMethodFilter: PlayMethodFilter;
  performanceFilter: PerformanceFilter;
  genreFilter: GenreFilter;
  chipsetGroups: ChipsetGroup[];
  playMethodOptions: { value: string; label: string }[];
  genreOptions: { value: string; label: string }[];
  ratingCounts?: Record<string, number>;
  onChipsetChange: (value: string) => void;
  onPlayMethodChange: (value: string) => void;
  onPerformanceChange: (filter: PerformanceFilter) => void;
  onGenreChange: (value: string) => void;
}

export const HomeFilters = ({
  chipsetFilter,
  playMethodFilter,
  performanceFilter,
  genreFilter,
  chipsetGroups,
  playMethodOptions,
  genreOptions,
  ratingCounts,
  onChipsetChange,
  onPlayMethodChange,
  onPerformanceChange,
  onGenreChange,
}: HomeFiltersProps) => {
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

          <GenreFilterComponent
            selectedGenre={genreFilter}
            genreOptions={genreOptions}
            onGenreChange={onGenreChange}
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
};
