import Link from 'next/link';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { GAME_CATEGORIES } from '@/modules/category/constants/GAME_CATEGORIES';
import { type GameCategory } from '@/modules/category/types/GameCategory';
import { type GameCategorySlug } from '@/modules/category/types/GameCategorySlug';

const GROUP_LABELS = {
  chip: 'By Apple Silicon chip',
  playMethod: 'By play method',
  genre: 'By genre',
} as const;

type CategoryGroup = keyof typeof GROUP_LABELS;

type CategoryLinksProps = {
  currentSlug?: GameCategorySlug;
  title: string;
};

const groupFor = (category: GameCategory): CategoryGroup => {
  if (isDefined(category.chipset)) {
    return 'chip';
  }
  if (isDefined(category.playMethod)) {
    return 'playMethod';
  }
  return 'genre';
};

export const CategoryLinks = ({ currentSlug, title }: CategoryLinksProps) => {
  const entries = Object.entries(GAME_CATEGORIES).filter(
    ([slug]) => slug !== currentSlug,
  );

  return (
    <nav aria-label={title} className="mt-12 border-t border-gray-800 pt-8">
      <h2 className="mb-6 text-lg font-semibold text-gray-200">{title}</h2>

      <div className="flex flex-col gap-6">
        {Object.entries(GROUP_LABELS).map(([group, label]) => {
          const groupEntries = entries.filter(
            ([, category]) => groupFor(category) === group,
          );

          if (!isNonEmptyArray(groupEntries)) {
            return null;
          }

          return (
            <div key={group}>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                {label}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {groupEntries.map(([slug, category]) => (
                  <li key={slug}>
                    <Link
                      href={`/mac-games/${slug}`}
                      className="inline-block rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
                    >
                      {category.heading}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
};
