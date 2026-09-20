import Link from 'next/link';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import { isNonEmptyArray } from '@sniptt/guards';
import { findCategorySlugForGenre } from '@/modules/category/utils/findCategorySlugForGenre';

const BADGE_CLASSNAME =
  'inline-flex items-center rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300';

type GameMetaBadgesProps = {
  releaseYear: number | null;
  genres: string[] | null;
};

export const GameMetaBadges = ({
  releaseYear,
  genres,
}: GameMetaBadgesProps) => {
  const genreList = genres ?? [];

  if (!isDefined(releaseYear) && !isNonEmptyArray(genreList)) {
    return null;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {isDefined(releaseYear) && (
        <li>
          <span className={BADGE_CLASSNAME}>{releaseYear}</span>
        </li>
      )}

      {genreList.map((genre) => {
        const categorySlug = findCategorySlugForGenre(genre);

        return (
          <li key={genre}>
            {isDefined(categorySlug) ? (
              <Link
                href={`/mac-games/${categorySlug}`}
                className={`${BADGE_CLASSNAME} transition-colors hover:border-gray-500 hover:text-white`}
              >
                {genre}
              </Link>
            ) : (
              <span className={BADGE_CLASSNAME}>{genre}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
};
