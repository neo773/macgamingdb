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
        // Get IP info for context (optional) - account for Cloudflare proxy
        let ipInfo = "Unknown";
        if (ctx.req) {
          // Cloudflare sets CF-Connecting-IP header with the real client IP
          const cfConnectingIp = ctx.req.headers.get('cf-connecting-ip');
          const forwarded = ctx.req.headers.get('x-forwarded-for');
          const realIp = ctx.req.headers.get('x-real-ip');
          
          // Priority: CF-Connecting-IP > X-Forwarded-For > X-Real-IP
          const ip = cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';
          ipInfo = ip;
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
}); 