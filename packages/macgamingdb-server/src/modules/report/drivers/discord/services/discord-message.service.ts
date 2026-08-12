import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { fetchWithRetryOrThrow } from '../../../../../engine/core-modules/http/utils/fetch-with-retry-or-throw.util';
import { ReportException } from '../../../exceptions/report.exception';
import { DISCORD_API_BASE } from '../constants/discord-message.constant';
import { type ModerationAlertParams } from '../types/moderation-alert-params.type';
import { type ModerationFailureAlertParams } from '../types/moderation-failure-alert-params.type';
import { buildModerationAlertBody } from '../utils/build-moderation-alert-body.util';
import { buildModerationFailureBody } from '../utils/build-moderation-failure-body.util';

@Injectable()
export class DiscordMessageService {
  async postModerationAlert(params: ModerationAlertParams): Promise<void> {
    await this.postMessageOrThrow(buildModerationAlertBody(params));
  }

  async postModerationFailureAlert(
    params: ModerationFailureAlertParams,
  ): Promise<void> {
    await this.postMessageOrThrow(buildModerationFailureBody(params));
  }

  private async postMessageOrThrow(body: unknown): Promise<void> {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_MODERATION_CHANNEL_ID;

    if (!isNonEmptyString(botToken) || !isNonEmptyString(channelId)) {
      throw new ReportException(
        'Discord bot token or channel id is not configured',
        'DISCORD_MISCONFIGURED',
      );
    }

    const response = await fetchWithRetryOrThrow({
      url: `${DISCORD_API_BASE}/channels/${channelId}/messages`,
      init: {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    });

    if (!response.ok) {
      throw new ReportException(
        `Discord message dispatch failed with status ${response.status}`,
        'DISCORD_DISPATCH_FAILED',
      );
    }
  }
}
