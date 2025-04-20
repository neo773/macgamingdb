import { parseHTML } from "linkedom";

/**
 * Represents a Steam app search result
 */
interface SteamApp {
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
export async function searchSteam(term: string): Promise<SteamApp[]> {
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
    const apps: SteamApp[] = Array.from(searchResults)
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
        } as SteamApp;
      })
      .filter((app): app is NonNullable<typeof app> => app !== null);

    return apps;
  } catch (error) {
    console.error("Error scraping Steam search results:", error);
    throw error;
  }
}
