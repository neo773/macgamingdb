import { parseHTML } from 'linkedom';
import { z } from 'zod';
import { extractReleaseYear } from '../../../utils/extract-release-year.util';
import type { SteamGameSearchObject } from '../types/steam-game-search-object.type';

const TagIdsSchema = z.array(z.coerce.string());

export const searchSteam = async (
  term: string,
): Promise<SteamGameSearchObject[]> => {
  try {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://store.steampowered.com/search/?term=${encodedTerm}&category1=998`;

    const response = await fetch(url);
    const html = await response.text();

    const { document } = parseHTML(html);

    const searchResults = document.querySelectorAll('.search_result_row');

    return Array.from(searchResults)
      .map((element): SteamGameSearchObject | null => {
        const appId = element.getAttribute('data-ds-appid');
        if (!appId) {
          return null;
        }

        const titleElement = element.querySelector('.search_name .title');
        const tagIdsAttribute = element.getAttribute('data-ds-tagids');

        return {
          objectID: appId,
          name: titleElement?.textContent?.trim() ?? '',
          url: element.getAttribute('href') ?? '',
          tagIds: tagIdsAttribute
            ? TagIdsSchema.parse(JSON.parse(tagIdsAttribute))
            : undefined,
          releaseYear: extractReleaseYear(
            element.querySelector('.search_released')?.textContent,
          ),
        };
      })
      .filter(
        (searchObject): searchObject is SteamGameSearchObject =>
          searchObject !== null,
      );
  } catch (error) {
    console.error('Error scraping Steam search results:', error);
    throw error;
  }
};
