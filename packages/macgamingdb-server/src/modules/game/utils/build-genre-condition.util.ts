import { like, type SQL } from 'drizzle-orm';
import { isDefined } from 'macgamingdb-shared/utils/isDefined';
import type { CanonicalGenre } from 'macgamingdb-shared/types/CanonicalGenre';
import { games } from '../../../database/schema';

export const buildGenreCondition = (
  genre: CanonicalGenre | undefined,
): SQL | undefined =>
  isDefined(genre) ? like(games.genres, `%"${genre}"%`) : undefined;
