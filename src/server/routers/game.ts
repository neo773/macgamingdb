import { z } from "zod";
import { router, procedure } from "../trpc";
import { searchGames } from "@/lib/algolia";

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

export const gameRouter = router({
  search: procedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      try {
        return await searchGames(input.query);
      } catch (error) {
        console.error("Search error:", error);
        throw new Error("Failed to search games");
      }
    }),

  getById: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Get game details from Algolia
        const response = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${input.id}`,
        );
        console.log(response.status, "steam status");
        const gameDetails = (await response.json()) as SteamApp;
        console.log(gameDetails);

        if (!gameDetails) {
          throw new Error("Game not found");
        }

        // Get reviews from our database
        const reviews = await ctx.prisma!.gameReview.findMany({
          where: { gameId: input.id },
        });

        // Calculate average ratings
        const reviewStats =
          reviews.length > 0
            ? {
                totalReviews: reviews.length,
                methods: {
                  native: reviews.filter((r) => r.playMethod === "NATIVE")
                    .length,
                  crossover: reviews.filter((r) => r.playMethod === "CROSSOVER")
                    .length,
                  parallels: reviews.filter((r) => r.playMethod === "PARALLELS")
                    .length,
                  other: reviews.filter((r) => r.playMethod === "OTHER").length,
                },
                averagePerformance: calculateAveragePerformance(reviews),
                translationLayers: calculateTranslationLayerStats(reviews),
              }
            : null;

        return {
          game: gameDetails[input.id].data,
          reviews,
          stats: reviewStats,
        };
      } catch (error) {
        console.error(`Error fetching game details for ID ${input.id}:`, error);
        throw new Error("Failed to fetch game details");
      }
    }),
});

// Helper function to calculate average performance
function calculateAveragePerformance(reviews: any[]) {
  const performanceMap = {
    UNPLAYABLE: 0,
    BARELY_PLAYABLE: 1,
    PLAYABLE: 2,
    GOOD: 3,
    EXCELLENT: 4,
  };

  const sum = reviews.reduce((acc, review) => {
    return (
      acc + performanceMap[review.performance as keyof typeof performanceMap]
    );
  }, 0);

  return reviews.length > 0 ? sum / reviews.length : 0;
}

// Helper function to calculate translation layer statistics
function calculateTranslationLayerStats(reviews: any[]) {
  const layers = ["DXVK", "DXMT", "D3D_METAL", "NONE"];
  const stats: Record<string, { count: number; averagePerformance: number }> =
    {};

  layers.forEach((layer) => {
    const layerReviews = reviews.filter((r) => r.translationLayer === layer);
    stats[layer] = {
      count: layerReviews.length,
      averagePerformance: calculateAveragePerformance(layerReviews),
    };
  });

  return stats;
}
