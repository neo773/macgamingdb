import { isNonEmptyString } from '@sniptt/guards';
import { REPORT_INTERACTION_ACTION } from '../../../constants/report-interaction-action.constant';
import {
  ACTION_ROW_TYPE,
  BUTTON_STYLE_DANGER,
  BUTTON_STYLE_LINK,
  BUTTON_STYLE_SECONDARY,
  BUTTON_TYPE,
  CATEGORY_LABEL,
  EMBED_DIVIDER,
  NOTES_PREVIEW_LIMIT,
  VERDICT_PRESENTATION,
  ZERO_WIDTH_SPACE,
} from '../constants/discord-message.constant';
import { type ModerationAlertParams } from '../types/moderation-alert-params.type';
import { buildConfidenceBar } from './build-confidence-bar.util';
import { formatBlockquote } from './format-blockquote.util';

export const buildModerationAlertBody = (params: ModerationAlertParams) => {
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
      formatBlockquote(verdict.rationale, '> _no rationale provided_'),
    ].join('\n'),
    ...(isNonEmptyString(params.gameHeaderImage)
      ? { thumbnail: { url: params.gameHeaderImage } }
      : {}),
    fields: [
      { name: '👤 Reported by', value: params.reporterName, inline: true },
      {
        name: '🏷️ Reason',
        value: params.reportReason ?? 'not specified',
        inline: true,
      },
      { name: ZERO_WIDTH_SPACE, value: EMBED_DIVIDER },
      { name: '🖥️ Configuration', value: configLines.join('\n') },
      {
        name: '💬 Review notes',
        value: formatBlockquote(notesPreview, '> _(empty)_'),
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
};
