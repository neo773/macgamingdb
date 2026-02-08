'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  SearchURLParamsKeys,
  type PerformanceFilter,
  createFilterConfig,
  type PlayMethodFilter,
  DEFAULT_PERFORMANCE_FILTER,
  DEFAULT_CHIPSET_FILTER,
  DEFAULT_PLAY_METHOD_FILTER,
} from '@/lib/constants';
import { getChipsetCombinations } from '@macgamingdb/server/utils/getChipsetCombinations';
import { PlayMethodEnum } from '@macgamingdb/server/schema';

export function useHomeFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const performanceFilter = (searchParams.get(SearchURLParamsKeys.PERFORMANCE) || DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter;
  const chipsetFilter = searchParams.get(SearchURLParamsKeys.CHIPSET) || DEFAULT_CHIPSET_FILTER;
  const playMethodFilter = (searchParams.get(SearchURLParamsKeys.PLAY_METHOD) || DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter;

  const chipsetOptions = useMemo(
    () => [{ value: DEFAULT_CHIPSET_FILTER, label: 'All Chipsets' }, ...getChipsetCombinations()],
    []
  );

  const playMethodOptions = useMemo(
    () => [
      { value: DEFAULT_PLAY_METHOD_FILTER, label: 'All Methods' },
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

    if (performance !== DEFAULT_PERFORMANCE_FILTER) {
      params.set(SearchURLParamsKeys.PERFORMANCE, performance);
    } else {
      params.delete(SearchURLParamsKeys.PERFORMANCE);
    }

    if (chipset !== DEFAULT_CHIPSET_FILTER) {
      params.set(SearchURLParamsKeys.CHIPSET, chipset);
    } else {
      params.delete(SearchURLParamsKeys.CHIPSET);
    }

    if (playMethod !== DEFAULT_PLAY_METHOD_FILTER) {
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
    updateFilters(DEFAULT_PERFORMANCE_FILTER, DEFAULT_CHIPSET_FILTER, DEFAULT_PLAY_METHOD_FILTER);
  };

  return {
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
    chipsetOptions,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  };
}
