import { isNonEmptyArray } from '@sniptt/guards';
import { STEAM_TAG_GENRE_ALIASES } from '../constants/STEAM_TAG_GENRE_ALIASES';
import { STEAM_TAG_MIN_VOTE_SHARE } from '../constants/STEAM_TAG_MIN_VOTE_SHARE';
import type { CanonicalGenre } from '../types/CanonicalGenre';

type DeriveGenresFromSteamTagsParams = {
  tagVotes: Record<string, number>;
};

export const deriveGenresFromSteamTags = ({
  tagVotes,
}: DeriveGenresFromSteamTagsParams): CanonicalGenre[] => {
  const voteCounts = Object.values(tagVotes);
  if (!isNonEmptyArray(voteCounts)) {
    return [];
  }

  const minimumVotes = Math.max(...voteCounts) * STEAM_TAG_MIN_VOTE_SHARE;

  const matched = Object.entries(tagVotes)
    .filter(([, votes]) => votes >= minimumVotes)
    .map(([tag]) => STEAM_TAG_GENRE_ALIASES[tag.trim().toLowerCase()])
    .filter((genre): genre is CanonicalGenre => genre !== undefined);

  return [...new Set(matched)].sort();
};
