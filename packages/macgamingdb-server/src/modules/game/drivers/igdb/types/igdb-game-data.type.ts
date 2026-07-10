export type IgdbGameData = {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  first_release_date?: number;
  cover?: {
    id: number;
    image_id: string;
  };
  screenshots?: Array<{
    image_id: string;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    id: number;
    name: string;
    abbreviation?: string;
  }>;
  involved_companies?: Array<{
    company: {
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }>;
  websites?: Array<{
    url: string;
    category: number;
  }>;
  external_games?: Array<{
    category?: number;
    external_game_source?: number;
    uid: string;
  }>;
  total_rating?: number;
  videos?: Array<{
    video_id: string;
  }>;
};
