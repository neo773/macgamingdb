import { Injectable } from '@nestjs/common';
import { TrafficException } from '../exceptions/traffic.exception';

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

@Injectable()
export class TrafficService {
  async submitSource(params: {
    source: string;
    userAgent?: string;
    ipInfo: string;
  }) {
    try {
      const discordPayload = {
        embeds: [
          {
            title: '🚀 New Traffic Source Response',
            color: 0x00ff00,
            fields: [
              { name: 'Source', value: params.source, inline: false },
              {
                name: 'Timestamp',
                value: new Date().toISOString(),
                inline: false,
              },
              { name: 'IP', value: params.ipInfo, inline: false },
              {
                name: 'User Agent',
                value: params.userAgent || 'Unknown',
                inline: false,
              },
            ],
            footer: { text: 'MacGamingDB Traffic Analytics' },
          },
        ],
      };

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      return { success: true, message: 'Thank you for your feedback!' };
    } catch (error) {
      console.error('Error submitting traffic source:', error);
      throw new TrafficException(
        'Failed to submit feedback',
        'TRAFFIC_SUBMIT_FAILED',
      );
    }
  }
}
