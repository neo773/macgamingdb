import { type z } from 'zod';
import {
  type ChipsetEnum,
  type ChipsetVariantEnum,
} from 'macgamingdb-server/schema';
import { isCanonicalGenre } from 'macgamingdb-shared/utils/isCanonicalGenre';
import { DEFAULT_CHIPSET_FILTER } from '@/modules/search/constants/DEFAULT_CHIPSET_FILTER';
import { DEFAULT_GENRE_FILTER } from '@/modules/search/constants/DEFAULT_GENRE_FILTER';
import { DEFAULT_PERFORMANCE_FILTER } from '@/modules/search/constants/DEFAULT_PERFORMANCE_FILTER';
import { DEFAULT_PLAY_METHOD_FILTER } from '@/modules/search/constants/DEFAULT_PLAY_METHOD_FILTER';
import { type FilterConfig } from '@/modules/search/types/FilterConfig';
import { type PerformanceFilter } from '@/modules/search/types/PerformanceFilter';
import { type PlayMethodFilter } from '@/modules/search/types/PlayMethodFilter';

const HOME_PAGE_SIZE = 6;

type CreateFilterConfigParams = {
  performanceParam?: string | null;
  chipsetParam?: string | null;
  playMethodParam?: string | null;
  genreParam?: string | null;
};

export const createFilterConfig = ({
  performanceParam,
  chipsetParam,
  playMethodParam,
  genreParam,
}: CreateFilterConfigParams): FilterConfig => {
  const performance = (performanceParam ||
    DEFAULT_PERFORMANCE_FILTER) as PerformanceFilter;
  const chipset = chipsetParam || DEFAULT_CHIPSET_FILTER;
  const playMethod = (playMethodParam ||
    DEFAULT_PLAY_METHOD_FILTER) as PlayMethodFilter;
  const genre = genreParam || DEFAULT_GENRE_FILTER;

  const config: FilterConfig = {
    limit: HOME_PAGE_SIZE,
    performance,
  };

  if (chipset !== DEFAULT_CHIPSET_FILTER) {
    const [chipsetValue, variantValue] = chipset.split('-') as [
      z.infer<typeof ChipsetEnum>,
      z.infer<typeof ChipsetVariantEnum>,
    ];
    config.chipset = chipsetValue;
    config.chipsetVariant = variantValue;
  }

  if (playMethod !== DEFAULT_PLAY_METHOD_FILTER) {
    config.playMethod = playMethod;
  }

  if (genre !== DEFAULT_GENRE_FILTER && isCanonicalGenre(genre)) {
    config.genre = genre;
  }

  return config;
};
