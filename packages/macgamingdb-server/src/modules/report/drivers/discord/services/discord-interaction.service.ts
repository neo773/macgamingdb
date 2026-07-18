import { Injectable } from '@nestjs/common';
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from 'discord-interactions';
import { z } from 'zod';
import { isNonEmptyString } from '@sniptt/guards';
import { ReviewService } from '../../../../review/services/review.service';
import { REPORT_INTERACTION_ACTION } from '../../../constants/report-interaction-action.constant';
import { ReportException } from '../../../exceptions/report.exception';

type VerifyAndHandleParams = {
  rawBody: Buffer;
  signature?: string;
  timestamp?: string;
};

type DiscordInteractionResponse = {
  type: number;
  data?: { content: string; components: [] };
};

const interactionPayloadSchema = z.object({
  type: z.number(),
  data: z.object({ custom_id: z.string() }).optional(),
  member: z.object({ user: z.object({ id: z.string() }) }).optional(),
  user: z.object({ id: z.string() }).optional(),
});

const parseCustomId = (
  customId: string,
): { action: string; reviewId: string } => {
  const separatorIndex = customId.indexOf(':');
  if (separatorIndex === -1) {
    return { action: customId, reviewId: '' };
  }
  return {
    action: customId.slice(0, separatorIndex),
    reviewId: customId.slice(separatorIndex + 1),
  };
};

@Injectable()
export class DiscordInteractionService {
  constructor(private readonly reviewService: ReviewService) {}

  async verifyAndHandle(
    params: VerifyAndHandleParams,
  ): Promise<DiscordInteractionResponse> {
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    if (!isNonEmptyString(publicKey)) {
      throw new ReportException(
        'DISCORD_PUBLIC_KEY is not configured',
        'DISCORD_MISCONFIGURED',
      );
    }

    const isValid =
      isNonEmptyString(params.signature) &&
      isNonEmptyString(params.timestamp) &&
      (await verifyKey(
        params.rawBody,
        params.signature,
        params.timestamp,
        publicKey,
      ));

    if (!isValid) {
      throw new ReportException(
        'Invalid Discord interaction signature',
        'DISCORD_SIGNATURE_INVALID',
      );
    }

    const payload = interactionPayloadSchema.parse(
      JSON.parse(params.rawBody.toString('utf8')),
    );

    if (payload.type === InteractionType.PING) {
      return { type: InteractionResponseType.PONG };
    }

    if (payload.type === InteractionType.MESSAGE_COMPONENT && payload.data) {
      return this.handleComponent({
        customId: payload.data.custom_id,
        actorId: payload.member?.user.id ?? payload.user?.id ?? 'unknown',
      });
    }

    return { type: InteractionResponseType.PONG };
  }

  private async handleComponent(params: {
    customId: string;
    actorId: string;
  }): Promise<DiscordInteractionResponse> {
    const { action, reviewId } = parseCustomId(params.customId);

    if (action === REPORT_INTERACTION_ACTION.REMOVE) {
      await this.reviewService.hideReviewById({ reviewId });
      return this.updateMessage(`🗑️ Review removed by <@${params.actorId}>`);
    }

    if (action === REPORT_INTERACTION_ACTION.KEEP) {
      return this.updateMessage(`✅ Review kept by <@${params.actorId}>`);
    }

    return this.updateMessage('Unsupported action');
  }

  private updateMessage(content: string): DiscordInteractionResponse {
    return {
      type: InteractionResponseType.UPDATE_MESSAGE,
      data: { content, components: [] },
    };
  }
}
