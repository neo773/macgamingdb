import { algoliasearch } from 'algoliasearch';


// Algolia client configuration
const ALGOLIA_APP_ID = '94HE6YATEI';
const ALGOLIA_API_KEY = '9ba0e69fb2974316cdaec8f5f257088f';
const ALGOLIA_INDEX_NAME = 'steamdb';

// Create the Algolia client
const searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY, {
  baseHeaders: {
    'Origin': 'https://www.protondb.com',
    'Referer': 'https://www.protondb.com/'
  }
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
export async function searchGames(query: string, page = 0, hitsPerPage = 50): Promise<any> {
  try {
    const result = await searchClient.search({
      requests: [
        {
          indexName: ALGOLIA_INDEX_NAME,
          query,
          page,
          hitsPerPage
        }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
}

// Function to get a specific game by ID
export async function getGameById(gameId: string): Promise<SteamGame | null> {
  try {
    const response = await searchClient.getObjects({
      requests: [
        {
          indexName: ALGOLIA_INDEX_NAME,
          objectID: gameId
        }
      ]
    });
    
    const game = response.results[0];
    return game ? (game as SteamGame) : null;
  } catch (error) {
    console.error(`Error fetching game with ID ${gameId}:`, error);
    return null;
  }
} 