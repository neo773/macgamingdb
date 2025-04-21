import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { getGameBySteamId } from "@/lib/steam";

// Define enum schemas using Zod
const PlayMethodEnum = z.enum(["NATIVE", "CROSSOVER", "PARALLELS"]);
const TranslationLayerEnum = z.enum(["DXVK", "DXMT", "D3D_METAL", "NONE"]);
const PerformanceEnum = z.enum([
  "EXCELLENT",
  "GOOD",
  "PLAYABLE",
  "BARELY_PLAYABLE",
  "UNPLAYABLE",
]);
const GraphicsSettingsEnum = z.enum(["ULTRA", "HIGH", "MEDIUM", "LOW"]);
const ChipsetEnum = z.enum(["M1", "M2", "M3", "M4"]);
const ChipsetVariantEnum = z.enum(["BASE", "PRO", "MAX", "ULTRA"]);

// Define schemas using Zod
const createReviewSchema = z.object({
  gameId: z.string(),
  playMethod: PlayMethodEnum,
  translationLayer: TranslationLayerEnum.nullable(),
  performance: PerformanceEnum,
  fps: z.number().nullable().optional(),
  graphicsSettings: GraphicsSettingsEnum,
  resolution: z.string().optional(),
  chipset: ChipsetEnum,
  chipsetVariant: ChipsetVariantEnum,
  notes: z.string().optional(),
  softwareVersion: z.string().optional(),
});

export const reviewRouter = router({
  // Get all enum values for client-side use
  getEnumValues: procedure.query(() => {
    return {
      playMethods: PlayMethodEnum.options,
      translationLayers: TranslationLayerEnum.options,
      performanceRatings: PerformanceEnum.options,
      graphicsSettings: GraphicsSettingsEnum.options,
      chipsets: ChipsetEnum.options,
      chipsetVariants: ChipsetVariantEnum.options,
    };
  }),

  // Get version defaults for different software
  getSoftwareVersions: procedure.query(() => {
    return {
      CROSSOVER: ["25.0", "24.0"],
      PARALLELS: ["20", "19"],
    };
  }),

  // Get chipset combinations
  getChipsetCombinations: procedure.query(() => {
    const combinations = [];
    for (const chipset of ChipsetEnum.options) {
      for (const variant of ChipsetVariantEnum.options) {
        combinations.push({
          value: `${chipset}-${variant}`,
          label: variant === "BASE" ? chipset : `${chipset} ${variant}`,
        });
      }
    }
    return combinations;
  }),

  // Check if user is authenticated
  getUserAuth: procedure.query(async ({ ctx }) => {
    return {
      authenticated: !!ctx.user,
      user: ctx.user || null,
    };
  }),

  create: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate the game exists in Algolia
        const gameExists = await getGameBySteamId(input.gameId);
        if (!gameExists) {
          throw new Error("Game not found");
        }

        // Create the game entry if it doesn't exist in our database
        await ctx.prisma!.game.upsert({
          where: { id: input.gameId },
          update: {},
          create: { id: input.gameId },
        });

        if (!ctx.user?.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Missing authorization ",
          });
        }

        // Create the review with the authenticated user's ID
        const review = await ctx.prisma!.gameReview.create({
          data: {
            gameId: input.gameId,
            userId: ctx.user.user.id,
            playMethod: input.playMethod,
            translationLayer: input.translationLayer,
            performance: input.performance,
            fps: input.fps,
            graphicsSettings: input.graphicsSettings,
            resolution: input.resolution || null,
            chipset: input.chipset,
            chipsetVariant: input.chipsetVariant,
            notes: input.notes || null,
            softwareVersion: input.softwareVersion || null,
          },
        });

        // Revalidate the game page to reflect the new review
        revalidatePath(`/games/${input.gameId}`);

        return { review };
      } catch (error) {
        console.error("Error creating review:", error);
        throw new Error("Failed to create review");
      }
    }),
});

// Export types derived from zod schemas for client usage
export type PlayMethod = z.infer<typeof PlayMethodEnum>;
export type TranslationLayer = z.infer<typeof TranslationLayerEnum>;
export type Performance = z.infer<typeof PerformanceEnum>;
export type GraphicsSettings = z.infer<typeof GraphicsSettingsEnum>;
export type Chipset = z.infer<typeof ChipsetEnum>;
export type ChipsetVariant = z.infer<typeof ChipsetVariantEnum>;
