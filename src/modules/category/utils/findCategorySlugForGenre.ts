import { GAME_CATEGORIES } from '@/modules/category/constants/GAME_CATEGORIES';
import { isGameCategorySlug } from '@/modules/category/utils/isGameCategorySlug';
import { type GameCategory } from '@/modules/category/types/GameCategory';
import { type GameCategorySlug } from '@/modules/category/types/GameCategorySlug';

export const findCategorySlugForGenre = (
  genre: string,
): GameCategorySlug | undefined =>
  Object.keys(GAME_CATEGORIES)
    .filter(isGameCategorySlug)
    .find((slug) => {
      const category: GameCategory = GAME_CATEGORIES[slug];
      return category.genre === genre;
    });
