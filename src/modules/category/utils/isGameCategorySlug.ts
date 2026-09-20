import { GAME_CATEGORIES } from '@/modules/category/constants/GAME_CATEGORIES';
import { type GameCategorySlug } from '@/modules/category/types/GameCategorySlug';

export const isGameCategorySlug = (slug: string): slug is GameCategorySlug =>
  Object.hasOwn(GAME_CATEGORIES, slug);
