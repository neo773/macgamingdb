import { algoliasearch } from "algoliasearch";

// Algolia client configuration
const ALGOLIA_APP_ID = "94HE6YATEI";
const ALGOLIA_API_KEY = "9ba0e69fb2974316cdaec8f5f257088f";
const ALGOLIA_INDEX_NAME = "steamdb";

// Create the Algolia client
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY, {
  baseHeaders: {
    Origin: "https://www.protondb.com",
    Referer: "https://www.protondb.com/",
  },
});

// Type definitions for Steam game data
export interface SteamGame {
  objectID: string; // Steam Game ID
  name: string;
  releaseYear?: number;
  followers?: number;
  oslist?: string[];
  tags?: string[];
  technologies?: string[];
  userScore?: number;
  lastUpdated?: string;
}

// Function to search for games
export async function searchGames(
  query: string,
  page = 0,
  hitsPerPage = 50
): Promise<SteamGame[]> {
  try {
    const result = await searchClient.search<SteamGame>({
      requests: [
        {
          indexName: ALGOLIA_INDEX_NAME,
          query,
          page,
          hitsPerPage,
        },
      ],
    });

    // Type assertion to handle the SearchResult union type issue
    return (result.results[0] as { hits: SteamGame[] }).hits;
  } catch (error) {
    console.error("Error searching games:", error);
    throw error;
  }
}


export async function getGameBySteamId(steamId: string): Promise<SteamGame | null> {
  try {
    const result = await searchClient.getObject({
      indexName: ALGOLIA_INDEX_NAME,
      objectID: steamId,
    });
    return result as unknown as SteamGame;
  } catch (error) {
    console.error("Error fetching game by Steam ID:", error);
    throw error;
  }
}

