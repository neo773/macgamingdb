'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  SearchURLParamsKeys,
  type PerformanceFilter,
  createFilterConfig,
  type PlayMethodFilter,
} from '@/lib/constants';
import { getChipsetCombinations } from '@macgamingdb/server/utils/getChipsetCombinations';
import { PlayMethodEnum } from '@macgamingdb/server/schema';

interface UseHomeFiltersOptions {
  performanceFilter: PerformanceFilter;
  chipsetFilter: string;
  playMethodFilter: PlayMethodFilter;
}

export function useHomeFilters({
  performanceFilter,
  chipsetFilter,
  playMethodFilter,
}: UseHomeFiltersOptions) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const chipsetOptions = useMemo(
    () => [{ value: 'all', label: 'All Chipsets' }, ...getChipsetCombinations()],
    []
  );

  const playMethodOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Methods' },
      ...PlayMethodEnum.options.map((method) => ({
        value: method,
        label: method,
      })),
    ],
    []
  );

  const filterConfig = useMemo(
    () => createFilterConfig(performanceFilter, chipsetFilter, playMethodFilter),
    [performanceFilter, chipsetFilter, playMethodFilter]
  );

  const updateFilters = (
    performance: PerformanceFilter,
    chipset: string,
    playMethod: PlayMethodFilter
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (performance !== 'ALL') {
      params.set(SearchURLParamsKeys.PERFORMANCE, performance);
    } else {
      params.delete(SearchURLParamsKeys.PERFORMANCE);
    }

    if (chipset !== 'all') {
      params.set(SearchURLParamsKeys.CHIPSET, chipset);
    } else {
      params.delete(SearchURLParamsKeys.CHIPSET);
    }

    if (playMethod !== 'ALL') {
      params.set(SearchURLParamsKeys.PLAY_METHOD, playMethod);
    } else {
      params.delete(SearchURLParamsKeys.PLAY_METHOD);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleFilterChange = (filter: PerformanceFilter) => {
    updateFilters(filter, chipsetFilter, playMethodFilter);
  };

  const handleChipsetChange = (value: string) => {
    updateFilters(performanceFilter, value, playMethodFilter);
  };

  const handlePlayMethodChange = (value: string) => {
    updateFilters(performanceFilter, chipsetFilter, value as PlayMethodFilter);
  };

  const resetFilters = () => {
    updateFilters('ALL', 'all', 'ALL');
  };

  return {
    chipsetOptions,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  };
}
