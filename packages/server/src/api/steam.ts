import { parseHTML } from 'linkedom';

/**
 * Represents a Steam app search result
 */
export interface SteamGameSearchObject {
  objectID: string;
  name: string;
  url: string;
  tagIds?: string[];
}

/**
 * Scrapes the Steam store search results for a given search term
 * @param term - The search term to query
 * @returns Promise containing an array of found Steam apps
 */
export async function searchSteam(
  term: string,
): Promise<SteamGameSearchObject[]> {
  try {
    const encodedTerm = encodeURIComponent(term);
    const url = `https://store.steampowered.com/search/?term=${encodedTerm}`;

    const response = await fetch(url);
    const html = await response.text();

    const { document } = parseHTML(html);

    const searchResults = document.querySelectorAll('.search_result_row');

    const apps: SteamGameSearchObject[] = Array.from(searchResults)
      .map((element) => {
        const appId = element.getAttribute('data-ds-appid');
        if (!appId) return null;

        const url = element.getAttribute('href') || '';

        const titleElement = element.querySelector('.search_name .title');
        const name = titleElement ? titleElement.textContent?.trim() || '' : '';

        const tagIdsAttr = element.getAttribute('data-ds-tagids');
        const tagIds = tagIdsAttr ? JSON.parse(tagIdsAttr) : undefined;

        return {
          objectID: appId,
          name,
          url,
          tagIds: tagIds?.map(String),
        } as SteamGameSearchObject;
      })
      .filter((app): app is NonNullable<typeof app> => app !== null);

    return apps;
  } catch (error) {
    console.error('Error scraping Steam search results:', error);
    throw error;
  }
}

export interface SteamAppsDetailsResponse {
  [key: string]: {
    success: boolean;
    data: SteamAppData;
  };
}

export interface SteamAppData {
  type: string;
  name: string;
  steam_appid: number;
  required_age: string;
  is_free: boolean;
  controller_support: string;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string;
  pc_requirements: {
    minimum: string;
    recommended: string;
  };
  mac_requirements: {
    minimum: string;
    recommended: string;
  };
  linux_requirements: {
    minimum: string;
    recommended: string;
  };
  legal_notice: string;
  ext_user_account_notice: string;
  developers: Array<string>;
  publishers: Array<string>;
  price_overview: {
    currency: string;
    initial: number;
    final: number;
    discount_percent: number;
    initial_formatted: string;
    final_formatted: string;
  };
  packages: Array<number>;
  package_groups: Array<{
    name: string;
    title: string;
    description: string;
    selection_text: string;
    save_text: string;
    display_type: number;
    is_recurring_subscription: string;
    subs: Array<{
      packageid: number;
      percent_savings_text: string;
      percent_savings: number;
      option_text: string;
      option_description: string;
      can_get_free_license: string;
      is_free_license: boolean;
      price_in_cents_with_discount: number;
    }>;
  }>;
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  categories: Array<{
    id: number;
    description: string;
  }>;
  genres: Array<{
    id: string;
    description: string;
  }>;
  screenshots: Array<{
    id: number;
    path_thumbnail: string;
    path_full: string;
  }>;
  recommendations: {
    total: number;
  };
  achievements: {
    total: number;
    highlighted: Array<{
      name: string;
      path: string;
    }>;
  };
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  support_info: {
    url: string;
    email: string;
  };
  background: string;
  background_raw: string;
  content_descriptors: {
    ids: Array<number>;
    notes: string;
  };
  ratings: {
    esrb: {
      rating: string;
      descriptors: string;
      required_age: string;
      use_age_gate: string;
    };
    pegi: {
      rating: string;
      descriptors: string;
      use_age_gate: string;
      required_age: string;
    };
    usk: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    oflc: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    nzoflc: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    kgrb: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    dejus: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    fpb: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    csrr: {
      rating: string;
      use_age_gate: string;
      required_age: string;
    };
    steam_germany: {
      rating_generated: string;
      rating: string;
      required_age: string;
      banned: string;
      use_age_gate: string;
      descriptors: string;
    };
  };
}

export async function getGameBySteamId(
  steamId: string,
): Promise<SteamAppData | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${steamId}`,
    );
    const gameDetails = (await response.json()) as SteamAppsDetailsResponse;

    if (!gameDetails || !gameDetails[steamId]?.success) {
      throw new Error('Game not found');
    }

    return gameDetails[steamId]?.data;
  } catch (error) {
    console.error('Error fetching game by Steam ID:', error);
    throw error;
  }
}
