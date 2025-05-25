import { z } from "zod";
import { router, procedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const submitTrafficSourceSchema = z.object({
  source: z.string().min(1).max(200),
  userAgent: z.string().optional(),
});

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1376158374869205003/As64ilk7OA--k8ULjDmXZneRdp2x88MHJzUXAIi1xSgl42j0oHR-4Ao5pJBLEap6wg77";

export const trafficRouter = router({
  submitSource: procedure
    .input(submitTrafficSourceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Get IP info for context (optional)
        let ipInfo = "Unknown";
        if (ctx.req) {
          const forwarded = ctx.req.headers.get('x-forwarded-for');
          const realIp = ctx.req.headers.get('x-real-ip');
          const ip = forwarded?.split(',')[0] || realIp || 'unknown';
          ipInfo = ip
        }

        // Create Discord embed message
        const discordPayload = {
          embeds: [
            {
              title: "🚀 New Traffic Source Response",
              color: 0x00ff00, // Green color
              fields: [
                {
                  name: "Source",
                  value: input.source,
                  inline: false,
                },
                {
                  name: "Timestamp",
                  value: new Date().toISOString(),
                  inline: false,
                },
                {
                  name: "IP",
                  value: ipInfo,
                  inline: false,
                },
                {
                  name: "User Agent",
                  value: input.userAgent || "Unknown",
                  inline: false,
                },
              ],
              footer: {
                text: "MacGamingDB Traffic Analytics",
              },
            },
          ],
        };

        // Send to Discord webhook
        const response = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discordPayload),
        });

        if (!response.ok) {
          throw new Error(`Discord webhook failed: ${response.status}`);
        }

        return { success: true, message: "Thank you for your feedback!" };
      } catch (error) {
        console.error("Error submitting traffic source:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feedback",
        });
      }
    }),

  // Optional: Get aggregated stats (admin only)
  getStats: procedure
    .query(async ({ ctx }) => {
      try {
        const stats = await ctx.prisma!.trafficSource.groupBy({
          by: ['source'],
          _count: { source: true },
          orderBy: { _count: { source: 'desc' } },
          take: 20,
        });

        const total = await ctx.prisma!.trafficSource.count();

        return {
          total,
          sources: stats.map((stat: { source: string; _count: { source: number } }) => ({
            source: stat.source,
            count: stat._count.source,
            percentage: ((stat._count.source / total) * 100).toFixed(1),
          })),
        };
      } catch (error) {
        console.error("Error fetching traffic stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch stats",
        });
      }
    }),
}); 