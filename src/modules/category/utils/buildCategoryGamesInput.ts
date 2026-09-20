import { type Chipset, type PlayMethod } from 'macgamingdb-server/schema';
import { type CanonicalGenre } from 'macgamingdb-shared/types/CanonicalGenre';
import { CATEGORY_PAGE_SIZE } from '@/modules/category/constants/CATEGORY_PAGE_SIZE';
import { type GameCategory } from '@/modules/category/types/GameCategory';

type CategoryGamesInput = {
  limit: number;
  performance: 'ALL';
  playMethod: 'ALL' | PlayMethod;
  chipset?: Chipset;
  genre?: CanonicalGenre;
};

export const buildCategoryGamesInput = ({
  chipset,
  playMethod,
  genre,
}: Pick<
  GameCategory,
  'chipset' | 'playMethod' | 'genre'
>): CategoryGamesInput => ({
  limit: CATEGORY_PAGE_SIZE,
  performance: 'ALL',
  playMethod: playMethod ?? 'ALL',
  ...(chipset ? { chipset } : {}),
  ...(genre ? { genre } : {}),
});
