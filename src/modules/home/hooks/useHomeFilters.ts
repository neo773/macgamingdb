'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SearchURLParamsKeys } from '@/modules/search/constants/SearchURLParamsKeys';
import { DEFAULT_PERFORMANCE_FILTER } from '@/modules/search/constants/DEFAULT_PERFORMANCE_FILTER';
import { DEFAULT_CHIPSET_FILTER } from '@/modules/search/constants/DEFAULT_CHIPSET_FILTER';
import { DEFAULT_PLAY_METHOD_FILTER } from '@/modules/search/constants/DEFAULT_PLAY_METHOD_FILTER';
import { DEFAULT_GENRE_FILTER } from '@/modules/search/constants/DEFAULT_GENRE_FILTER';
import { createFilterConfig } from '@/modules/search/utils/createFilterConfig';
import { type PerformanceFilter } from '@/modules/search/types/PerformanceFilter';
import { type PlayMethodFilter } from '@/modules/search/types/PlayMethodFilter';
import { type GenreFilter } from '@/modules/search/types/GenreFilter';
import { getGroupedChipsetCombinations } from 'macgamingdb-server/modules/mac-config/utils/get-chipset-combinations';
import { PLAY_METHODS } from 'macgamingdb-server/schema/constants';
import { CANONICAL_GENRES } from 'macgamingdb-shared/constants/CANONICAL_GENRES';

export const useHomeFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>(
    () =>
      (searchParams.get(SearchURLParamsKeys.PERFORMANCE) ||
        DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter,
  );
  const [chipsetFilter, setChipsetFilter] = useState(
    () =>
      searchParams.get(SearchURLParamsKeys.CHIPSET) || DEFAULT_CHIPSET_FILTER,
  );
  const [playMethodFilter, setPlayMethodFilter] = useState<PlayMethodFilter>(
    () =>
      (searchParams.get(SearchURLParamsKeys.PLAY_METHOD) ||
        DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter,
  );

  const [genreFilter, setGenreFilter] = useState<GenreFilter>(
    () =>
      (searchParams.get(SearchURLParamsKeys.GENRE) ||
        DEFAULT_GENRE_FILTER) as GenreFilter,
  );

  const isDefaultFilter =
    performanceFilter === DEFAULT_PERFORMANCE_FILTER &&
    chipsetFilter === DEFAULT_CHIPSET_FILTER &&
    playMethodFilter === DEFAULT_PLAY_METHOD_FILTER &&
    genreFilter === DEFAULT_GENRE_FILTER;

  const filterConfig = useMemo(
    () =>
      createFilterConfig({
        performanceParam: performanceFilter,
        chipsetParam: chipsetFilter,
        playMethodParam: playMethodFilter,
        genreParam: genreFilter,
      }),
    [performanceFilter, chipsetFilter, playMethodFilter, genreFilter],
  );

  const chipsetGroups = useMemo(() => getGroupedChipsetCombinations(), []);

  const playMethodOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Methods' },
      ...PLAY_METHODS.map((method) => ({
        value: method,
        label: method,
      })),
    ],
    [],
  );

  const genreOptions = useMemo(
    () => [
      { value: DEFAULT_GENRE_FILTER, label: 'All Genres' },
      ...CANONICAL_GENRES.map((genre) => ({ value: genre, label: genre })),
    ],
    [],
  );

  const syncURL = ({
    performance,
    chipset,
    playMethod,
    genre,
  }: {
    performance: PerformanceFilter;
    chipset: string;
    playMethod: PlayMethodFilter;
    genre: GenreFilter;
  }) => {
    const params = new URLSearchParams();

    if (performance !== DEFAULT_PERFORMANCE_FILTER) {
      params.set(SearchURLParamsKeys.PERFORMANCE, performance);
    }
    if (chipset !== DEFAULT_CHIPSET_FILTER) {
      params.set(SearchURLParamsKeys.CHIPSET, chipset);
    }
    if (playMethod !== DEFAULT_PLAY_METHOD_FILTER) {
      params.set(SearchURLParamsKeys.PLAY_METHOD, playMethod);
    }
    if (genre !== DEFAULT_GENRE_FILTER) {
      params.set(SearchURLParamsKeys.GENRE, genre);
    }

    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const handleFilterChange = (filter: PerformanceFilter) => {
    setPerformanceFilter(filter);
    syncURL({
      performance: filter,
      chipset: chipsetFilter,
      playMethod: playMethodFilter,
      genre: genreFilter,
    });
  };

  const handleChipsetChange = (value: string) => {
    setChipsetFilter(value);
    syncURL({
      performance: performanceFilter,
      chipset: value,
      playMethod: playMethodFilter,
      genre: genreFilter,
    });
  };

  const handlePlayMethodChange = (value: string) => {
    setPlayMethodFilter(value as PlayMethodFilter);
    syncURL({
      performance: performanceFilter,
      chipset: chipsetFilter,
      playMethod: value as PlayMethodFilter,
      genre: genreFilter,
    });
  };

  const handleGenreChange = (value: string) => {
    setGenreFilter(value as GenreFilter);
    syncURL({
      performance: performanceFilter,
      chipset: chipsetFilter,
      playMethod: playMethodFilter,
      genre: value as GenreFilter,
    });
  };

  const resetFilters = () => {
    setPerformanceFilter(DEFAULT_PERFORMANCE_FILTER);
    setChipsetFilter(DEFAULT_CHIPSET_FILTER);
    setPlayMethodFilter(DEFAULT_PLAY_METHOD_FILTER);
    setGenreFilter(DEFAULT_GENRE_FILTER);
    syncURL({
      performance: DEFAULT_PERFORMANCE_FILTER,
      chipset: DEFAULT_CHIPSET_FILTER,
      playMethod: DEFAULT_PLAY_METHOD_FILTER,
      genre: DEFAULT_GENRE_FILTER,
    });
  };

  return {
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
    genreFilter,
    isDefaultFilter,
    chipsetGroups,
    playMethodOptions,
    genreOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    handleGenreChange,
    resetFilters,
  };
};
