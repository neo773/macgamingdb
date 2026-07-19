import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { ReportException } from '../../../exceptions/report.exception';
import { DISCORD_API_BASE } from '../constants/discord-message.constant';
import { type ModerationAlertParams } from '../types/moderation-alert-params.type';
import { buildModerationAlertBody } from '../utils/build-moderation-alert-body.util';

@Injectable()
export class DiscordMessageService {
  async postModerationAlert(params: ModerationAlertParams): Promise<void> {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_MODERATION_CHANNEL_ID;

    if (!isNonEmptyString(botToken) || !isNonEmptyString(channelId)) {
      throw new ReportException(
        'Discord bot token or channel id is not configured',
        'DISCORD_MISCONFIGURED',
      );
    }

    const response = await fetch(
      `${DISCORD_API_BASE}/channels/${channelId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildModerationAlertBody(params)),
      },
    );

    if (!response.ok) {
      throw new ReportException(
        `Discord message dispatch failed with status ${response.status}`,
        'DISCORD_DISPATCH_FAILED',
      );
    }
  }
}
