import { parseHTML } from "linkedom";

/**
 * Represents a Steam app search result
 */
interface SteamAppStore {
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
export async function searchSteam(term: string): Promise<SteamAppStore[]> {
  try {
    // URL encode the search term
    const encodedTerm = encodeURIComponent(term);
    const url = `https://store.steampowered.com/search/?term=${encodedTerm}`;

    // Fetch the search page
    const response = await fetch(url);
    const html = await response.text();

    // Parse the HTML using linkedom
    const { document } = parseHTML(html);

    // Find all search result rows
    const searchResults = document.querySelectorAll(".search_result_row");

    // Map the results to SteamApp objects
    const apps: SteamAppStore[] = Array.from(searchResults)
      .map((element) => {
        // Extract the app ID from the data attribute
        const appId = element.getAttribute("data-ds-appid");
        if (!appId) return null;

        // Extract the URL and name from the href
        const url = element.getAttribute("href") || "";

        // Extract the name from the title element
        const titleElement = element.querySelector(".search_name .title");
        const name = titleElement ? titleElement.textContent?.trim() || "" : "";

        // Extract tag IDs if available
        const tagIdsAttr = element.getAttribute("data-ds-tagids");
        const tagIds = tagIdsAttr ? JSON.parse(tagIdsAttr) : undefined;

        return {
          objectID: appId,
          name,
          url,
          tagIds: tagIds?.map(String),
        } as SteamAppStore;
      })
      .filter((app): app is NonNullable<typeof app> => app !== null);

    return apps;
  } catch (error) {
    console.error("Error scraping Steam search results:", error);
    throw error;
  }
}



interface SteamApp {
  [key: string]: {
    success: boolean;
    data: SteamAppData;
  };
}

interface SteamAppData {
  type: string;
  name: string;
  steam_appid: number;
  required_age: string;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  supported_languages: string;
  header_image: string;
  capsule_image: string;
  capsule_imagev5: string;
  website: string;
  pc_requirements: Pc_requirements;
  mac_requirements: Mac_requirements;
  linux_requirements: Linux_requirements;
  legal_notice: string;
  ext_user_account_notice: string;
  developers: string[];
  publishers: string[];
  price_overview: Price_overview;
  packages: number[];
  package_groups: PackageGroupsItem[];
  platforms: Platforms;
  categories: CategoriesItem[];
  genres: GenresItem[];
  screenshots: ScreenshotsItem[];
  movies: MoviesItem[];
  recommendations: Recommendations;
  achievements: Achievements;
  release_date: Release_date;
  support_info: Support_info;
  background: string;
  background_raw: string;
  content_descriptors: Content_descriptors;
  ratings: Ratings;
}
interface Pc_requirements {
  minimum: string;
  recommended: string;
}
interface Mac_requirements {
  minimum: string;
  recommended: string;
}
interface Linux_requirements {
  minimum: string;
  recommended: string;
}
interface Price_overview {
  currency: string;
  initial: number;
  final: number;
  discount_percent: number;
  initial_formatted: string;
  final_formatted: string;
}
interface PackageGroupsItem {
  name: string;
  title: string;
  description: string;
  selection_text: string;
  save_text: string;
  display_type: number;
  is_recurring_subscription: string;
  subs: SubsItem[];
}
interface SubsItem {
  packageid: number;
  percent_savings_text: string;
  percent_savings: number;
  option_text: string;
  option_description: string;
  can_get_free_license: string;
  is_free_license: boolean;
  price_in_cents_with_discount: number;
}
interface Platforms {
  windows: boolean;
  mac: boolean;
  linux: boolean;
}
interface CategoriesItem {
  id: number;
  description: string;
}
interface GenresItem {
  id: string;
  description: string;
}
interface ScreenshotsItem {
  id: number;
  path_thumbnail: string;
  path_full: string;
}
interface MoviesItem {
  id: number;
  name: string;
  thumbnail: string;
  webm: Webm;
  mp4: Mp4;
  highlight: boolean;
}
interface Webm {
  480: string;
  max: string;
}
interface Mp4 {
  480: string;
  max: string;
}
interface Recommendations {
  total: number;
}
interface Achievements {
  total: number;
  highlighted: HighlightedItem[];
}
interface HighlightedItem {
  name: string;
  path: string;
}
interface Release_date {
  coming_soon: boolean;
  date: string;
}
interface Support_info {
  url: string;
  email: string;
}
interface Content_descriptors {
  ids: number[];
  notes: string;
}
interface Ratings {
  esrb: Esrb;
  pegi: Pegi;
  usk: Usk;
  dejus: Dejus;
  steam_germany: Steam_germany;
}
interface Esrb {
  rating: string;
  descriptors: string;
  use_age_gate: string;
  required_age: string;
}
interface Pegi {
  rating: string;
  descriptors: string;
  use_age_gate: string;
  required_age: string;
}
interface Usk {
  rating: string;
  required_age: string;
}
interface Dejus {
  rating_generated: string;
  rating: string;
  required_age: string;
  banned: string;
  use_age_gate: string;
  descriptors: string;
}
interface Steam_germany {
  rating_generated: string;
  rating: string;
  required_age: string;
  banned: string;
  use_age_gate: string;
  descriptors: string;
}


export async function getGameBySteamId(
  steamId: string
): Promise<SteamApp | null> {
  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${steamId}`,
    );
    console.log(response.status, "steam status");
    const gameDetails = (await response.json()) as SteamApp;
    console.log(gameDetails);

    if (!gameDetails || !gameDetails[steamId]?.success) {
      throw new Error("Game not found");
    }

    return gameDetails;

  } catch (error) {
    console.error("Error fetching game by Steam ID:", error);
    throw error;
  }
}