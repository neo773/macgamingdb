import { z } from 'zod';
import { router, procedure } from '../trpc';
import { TRPCError } from '@trpc/server';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

export const trafficRouter = router({
  submitSource: procedure
    .input( z.object({
      source: z.string().min(1).max(200),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        let ipInfo = 'Unknown';
        if (ctx.req) {
          const cfConnectingIp = ctx.req.headers.get('cf-connecting-ip');
          const forwarded = ctx.req.headers.get('x-forwarded-for');
          const realIp = ctx.req.headers.get('x-real-ip');

          const ip =
            cfConnectingIp || forwarded?.split(',')[0] || realIp || 'unknown';
          ipInfo = ip;
        }

        const discordPayload = {
          embeds: [
            {
              title: '🚀 New Traffic Source Response',
              color: 0x00ff00,
              fields: [
                {
                  name: 'Source',
                  value: input.source,
                  inline: false,
                },
                {
                  name: 'Timestamp',
                  value: new Date().toISOString(),
                  inline: false,
                },
                {
                  name: 'IP',
                  value: ipInfo,
                  inline: false,
                },
                {
                  name: 'User Agent',
                  value: input.userAgent || 'Unknown',
                  inline: false,
                },
              ],
              footer: {
                text: 'MacGamingDB Traffic Analytics',
              },
            },
          ],
        };

        const response = await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordPayload),
        });

        if (!response.ok) {
          throw new Error(`Discord webhook failed: ${response.status}`);
        }

        return { success: true, message: 'Thank you for your feedback!' };
      } catch (error) {
        console.error('Error submitting traffic source:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit feedback',
        });
      }
    }),
});
