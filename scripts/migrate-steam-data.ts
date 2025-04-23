// @ts-ignore
import { createPrismaClient } from "@/lib/prisma";
import { getGameBySteamId } from "@/lib/steam";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { TRPCError } from "@trpc/server";

const prisma = createPrismaClient(
  process.env.NODE_ENV === "production"
    ? new PrismaLibSQL({
        url: `${process.env.LIBSQL_DATABASE_URL}`,
        authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
      })
    : undefined
);

// Retry configuration
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // 30 seconds

// Rate limiting configuration
const REQUESTS_PER_MINUTE = 100;
const requestTimestamps: number[] = [];

/**
 * Implements a simple rate limiter
 * @returns Promise that resolves when it's safe to make a request
 */
async function rateLimiter(): Promise<void> {
  const now = Date.now();
  // Remove timestamps older than 1 minute
  const oneMinuteAgo = now - 60000;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
    requestTimestamps.shift();
  }

  // If we've made too many requests in the last minute, wait
  if (requestTimestamps.length >= REQUESTS_PER_MINUTE) {
    const oldestTimestamp = requestTimestamps[0];
    const waitTime = 60000 - (now - oldestTimestamp);
    console.log(
      `Rate limit reached. Waiting ${waitTime}ms before next request...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    return rateLimiter(); // Check again after waiting
  }

  // Add current timestamp to the list
  requestTimestamps.push(now);
}

/**
 * Fetches game data with exponential backoff retry
 */
async function fetchGameWithRetry(gameId: string): Promise<any> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Wait for rate limiter before making request
      await rateLimiter();

      const response = await getGameBySteamId(gameId);
      return response;
    } catch (error) {
      retries++;
      if (retries >= MAX_RETRIES) {
        console.error(`All retries failed for game ${gameId}`);
        throw error;
      }

      // Calculate exponential backoff with jitter
      const delay = Math.min(
        MAX_DELAY,
        BASE_DELAY * Math.pow(2, retries) * (0.5 + Math.random() * 0.5)
      );

      console.log(
        `Request failed for game ${gameId}. Retrying in ${Math.round(delay)}ms... (Attempt ${retries}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  console.log("Starting Steam data migration...");

  const games = await prisma.game.findMany({});
  console.log(`Found ${games.length} games to update`);

  for (const game of games) {
    try {
      if (game.details !== null) {
        console.log(`Skipping game ${game.id}...`);
        continue;
      }
      console.log(`Updating game ${game.id}...`);

      const response = await fetchGameWithRetry(game.id);
      if (!response) {
        console.warn(`Game with ID ${game.id} not found on Steam.`);
        continue;
      }

      const gameDetails = JSON.stringify(response);
      console.log(gameDetails);

      await prisma.game.update({
        where: { id: game.id },
        data: { details: gameDetails },
      });

      console.log(`Successfully updated game ${game.id}`);
    } catch (error) {
      console.error(`Error updating game ${game.id}:`, error);
    }
  }

  console.log("Steam data migration completed");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
