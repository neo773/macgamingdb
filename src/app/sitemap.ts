import type { MetadataRoute } from "next";
import { createPrismaClient } from "@/lib/database/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prisma = createPrismaClient();

  // Get all games that have at least one review, including their most recent review
  const gamesWithReviews = await prisma.game.findMany({
    where: {
      reviews: {
        some: {}, // This filters for games that have at least one review
      },
    },
    include: {
      reviews: {
        orderBy: { updatedAt: "desc" },
        take: 1, // Only get the most recent review
      },
    },
  });

  // Base URL for the site
  const baseUrl = process.env.NEXT_PUBLIC_URL;

  // Add dynamic game routes for games with reviews, using last review update time
  const gameRoutes = gamesWithReviews.map((game) => ({
    url: `${baseUrl}/games/${game.id}`,
    lastModified: game.reviews[0].updatedAt ?? undefined,
  }));

  return [...gameRoutes];
}
