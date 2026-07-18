import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { ReportException } from '../../../exceptions/report.exception';
import { REPORT_INTERACTION_ACTION } from '../../../constants/report-interaction-action.constant';
import { type ModerationVerdict } from '../../../dtos/moderation-verdict.dto';

type PostModerationAlertParams = {
  reviewId: string;
  gameName: string;
  gameHeaderImage?: string;
  reviewUrl: string;
  playMethod: string;
  translationLayer?: string;
  chipset: string;
  performance: string;
  notes: string;
  reportReason?: string;
  reporterName: string;
  verdict: ModerationVerdict;
};

type VerdictPresentation = {
  emoji: string;
  label: string;
  color: number;
};

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const NOTES_PREVIEW_LIMIT = 1000;
const CONFIDENCE_BAR_SEGMENTS = 10;
const DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━';
const ZERO_WIDTH = '​';

const ACTION_ROW_TYPE = 1;
const BUTTON_TYPE = 2;
const BUTTON_STYLE_DANGER = 4;
const BUTTON_STYLE_SECONDARY = 2;
const BUTTON_STYLE_LINK = 5;

const VERDICT_PRESENTATION: Record<
  ModerationVerdict['verdict'],
  VerdictPresentation
> = {
  flag: { emoji: '🚩', label: 'Flagged', color: 0xed4245 },
  ok: { emoji: '✅', label: 'Looks OK', color: 0x57f287 },
  uncertain: { emoji: '🤔', label: 'Uncertain', color: 0xfee75c },
};

const CATEGORY_LABEL: Record<ModerationVerdict['category'], string> = {
  spam: '🗑️ Spam',
  inaccurate: '❌ Inaccurate',
  other: '⚠️ Other',
  none: '➖ None',
};

const buildConfidenceBar = (confidence: number): string => {
  const filled = Math.round(confidence * CONFIDENCE_BAR_SEGMENTS);
  const bar =
    '▰'.repeat(filled) + '▱'.repeat(CONFIDENCE_BAR_SEGMENTS - filled);
  return `${bar} ${Math.round(confidence * 100)}%`;
};

const toBlockquote = (text: string, fallback: string): string => {
  if (!isNonEmptyString(text.trim())) {
    return fallback;
  }
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
};

@Injectable()
export class DiscordMessageService {
  async postModerationAlert(params: PostModerationAlertParams): Promise<void> {
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
        body: JSON.stringify(this.buildMessageBody(params)),
      },
    );

    if (!response.ok) {
      throw new ReportException(
        `Discord message dispatch failed with status ${response.status}`,
        'DISCORD_DISPATCH_FAILED',
      );
    }
  }

  private buildMessageBody(params: PostModerationAlertParams) {
    const { verdict } = params;
    const presentation = VERDICT_PRESENTATION[verdict.verdict];

    const notesPreview =
      params.notes.length > NOTES_PREVIEW_LIMIT
        ? `${params.notes.slice(0, NOTES_PREVIEW_LIMIT)}…`
        : params.notes;

    const configLines = [
      `• **Play method** · ${params.playMethod}`,
      params.translationLayer
        ? `• **Translation layer** · ${params.translationLayer}`
        : undefined,
      `• **Chipset** · ${params.chipset}`,
      `• **Performance** · ${params.performance}`,
    ].filter((line): line is string => typeof line === 'string');

    const embed = {
      author: { name: `🎮 ${params.gameName}` },
      title: `${presentation.emoji} ${presentation.label} · ${
        CATEGORY_LABEL[verdict.category]
      }`,
      url: params.reviewUrl,
      color: presentation.color,
      description: [
        `**Confidence**  ${buildConfidenceBar(verdict.confidence)}`,
        '',
        toBlockquote(verdict.rationale, '> _no rationale provided_'),
      ].join('\n'),
      ...(isNonEmptyString(params.gameHeaderImage)
        ? { thumbnail: { url: params.gameHeaderImage } }
        : {}),
      fields: [
        {
          name: '👤 Reported by',
          value: params.reporterName,
          inline: true,
        },
        {
          name: '🏷️ Reason',
          value: params.reportReason ?? 'not specified',
          inline: true,
        },
        { name: ZERO_WIDTH, value: DIVIDER },
        {
          name: '🖥️ Configuration',
          value: configLines.join('\n'),
        },
        {
          name: '💬 Review notes',
          value: toBlockquote(notesPreview, '> _(empty)_'),
        },
      ],
      footer: {
        text: `MacGamingDB moderation • ${
          process.env.MODERATION_MODEL ?? 'moderation model'
        }`,
      },
      timestamp: new Date().toISOString(),
    };

    return {
      embeds: [embed],
      components: [
        {
          type: ACTION_ROW_TYPE,
          components: [
            {
              type: BUTTON_TYPE,
              style: BUTTON_STYLE_DANGER,
              label: 'Remove review',
              emoji: { name: '🗑️' },
              custom_id: `${REPORT_INTERACTION_ACTION.REMOVE}:${params.reviewId}`,
            },
            {
              type: BUTTON_TYPE,
              style: BUTTON_STYLE_SECONDARY,
              label: 'Keep review',
              emoji: { name: '✅' },
              custom_id: `${REPORT_INTERACTION_ACTION.KEEP}:${params.reviewId}`,
            },
            {
              type: BUTTON_TYPE,
              style: BUTTON_STYLE_LINK,
              label: 'View review',
              url: params.reviewUrl,
            },
          ],
        },
      ],
    };
  }
}
