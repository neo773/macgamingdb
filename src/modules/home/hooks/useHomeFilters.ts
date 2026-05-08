'use client';

import { useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SearchURLParamsKeys,
  type PerformanceFilter,
  createFilterConfig,
  type PlayMethodFilter,
  DEFAULT_PERFORMANCE_FILTER,
  DEFAULT_CHIPSET_FILTER,
  DEFAULT_PLAY_METHOD_FILTER,
} from '@/lib/constants';
import { getGroupedChipsetCombinations } from '@macgamingdb/server/utils/getChipsetCombinations';
import { PlayMethodEnum } from '@macgamingdb/server/schema';

function readInitialSearchParams(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function useHomeFilters() {
  const router = useRouter();
  const { replace: routerReplace } = router;
  const pathname = usePathname();

  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>(
    () =>
      (readInitialSearchParams().get(SearchURLParamsKeys.PERFORMANCE) ||
        DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter
  );
  const [chipsetFilter, setChipsetFilter] = useState(
    () =>
      readInitialSearchParams().get(SearchURLParamsKeys.CHIPSET) ||
      DEFAULT_CHIPSET_FILTER
  );
  const [playMethodFilter, setPlayMethodFilter] = useState<PlayMethodFilter>(
    () =>
      (readInitialSearchParams().get(SearchURLParamsKeys.PLAY_METHOD) ||
        DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter
  );

  const isDefaultFilter =
    performanceFilter === DEFAULT_PERFORMANCE_FILTER &&
    chipsetFilter === DEFAULT_CHIPSET_FILTER &&
    playMethodFilter === DEFAULT_PLAY_METHOD_FILTER;

  const filterConfig = useMemo(
    () => createFilterConfig(performanceFilter, chipsetFilter, playMethodFilter),
    [performanceFilter, chipsetFilter, playMethodFilter]
  );

  const chipsetGroups = useMemo(() => getGroupedChipsetCombinations(), []);

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

  const syncURL = (performance: PerformanceFilter, chipset: string, playMethod: PlayMethodFilter) => {
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

    const queryString = params.toString();
    routerReplace(`${pathname}${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  };

  const handleFilterChange = (filter: PerformanceFilter) => {
    setPerformanceFilter(filter);
    syncURL(filter, chipsetFilter, playMethodFilter);
  };

  const handleChipsetChange = (value: string) => {
    setChipsetFilter(value);
    syncURL(performanceFilter, value, playMethodFilter);
  };

  const handlePlayMethodChange = (value: string) => {
    setPlayMethodFilter(value as PlayMethodFilter);
    syncURL(performanceFilter, chipsetFilter, value as PlayMethodFilter);
  };

  const resetFilters = () => {
    setPerformanceFilter(DEFAULT_PERFORMANCE_FILTER);
    setChipsetFilter(DEFAULT_CHIPSET_FILTER);
    setPlayMethodFilter(DEFAULT_PLAY_METHOD_FILTER);
    syncURL(DEFAULT_PERFORMANCE_FILTER, DEFAULT_CHIPSET_FILTER, DEFAULT_PLAY_METHOD_FILTER);
  };

  return {
    performanceFilter,
    chipsetFilter,
    playMethodFilter,
    isDefaultFilter,
    chipsetGroups,
    playMethodOptions,
    filterConfig,
    handleFilterChange,
    handleChipsetChange,
    handlePlayMethodChange,
    resetFilters,
  };
}
