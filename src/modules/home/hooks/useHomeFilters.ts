'use client';

import { useState, useMemo, useCallback } from 'react';
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

  const [performanceFilter, setPerformanceFilter] = useState<PerformanceFilter>(
    () => (searchParams.get(SearchURLParamsKeys.PERFORMANCE) || DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter
  );
  const [chipsetFilter, setChipsetFilter] = useState<string>(
    () => searchParams.get(SearchURLParamsKeys.CHIPSET) || DEFAULT_CHIPSET_FILTER
  );
  const [playMethodFilter, setPlayMethodFilter] = useState<PlayMethodFilter>(
    () => (searchParams.get(SearchURLParamsKeys.PLAY_METHOD) || DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter
  );

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

  const syncURL = useCallback((
    performance: PerformanceFilter,
    chipset: string,
    playMethod: PlayMethodFilter
  ) => {
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

    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router, pathname]);

  const handleFilterChange = useCallback((filter: PerformanceFilter) => {
    setPerformanceFilter(filter);
    syncURL(filter, chipsetFilter, playMethodFilter);
  }, [chipsetFilter, playMethodFilter, syncURL]);

  const handleChipsetChange = useCallback((value: string) => {
    setChipsetFilter(value);
    syncURL(performanceFilter, value, playMethodFilter);
  }, [performanceFilter, playMethodFilter, syncURL]);

  const handlePlayMethodChange = useCallback((value: string) => {
    setPlayMethodFilter(value as PlayMethodFilter);
    syncURL(performanceFilter, chipsetFilter, value as PlayMethodFilter);
  }, [performanceFilter, chipsetFilter, syncURL]);

  const resetFilters = useCallback(() => {
    setPerformanceFilter(DEFAULT_PERFORMANCE_FILTER);
    setChipsetFilter(DEFAULT_CHIPSET_FILTER);
    setPlayMethodFilter(DEFAULT_PLAY_METHOD_FILTER);
    syncURL(DEFAULT_PERFORMANCE_FILTER, DEFAULT_CHIPSET_FILTER, DEFAULT_PLAY_METHOD_FILTER);
  }, [syncURL]);

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
