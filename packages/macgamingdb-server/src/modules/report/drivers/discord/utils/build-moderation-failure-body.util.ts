import {
  ACTION_ROW_TYPE,
  BUTTON_STYLE_LINK,
  BUTTON_TYPE,
  FAILURE_STAGE_LABEL,
  MODERATION_FAILURE_COLOR,
  NOTES_PREVIEW_LIMIT,
} from '../constants/discord-message.constant';
import { type ModerationFailureAlertParams } from '../types/moderation-failure-alert-params.type';
import { formatBlockquote } from './format-blockquote.util';

export const buildModerationFailureBody = (
  params: ModerationFailureAlertParams,
) => {
  const failurePreview =
    params.failureMessage.length > NOTES_PREVIEW_LIMIT
      ? `${params.failureMessage.slice(0, NOTES_PREVIEW_LIMIT)}…`
      : params.failureMessage;

  const embed = {
    author: { name: `🎮 ${params.gameName}` },
    title: `🛑 Moderation failed · ${FAILURE_STAGE_LABEL[params.stage]}`,
    url: params.reviewUrl,
    color: MODERATION_FAILURE_COLOR,
    description: [
      'This review was **not** moderated automatically and needs a manual look.',
      '',
      formatBlockquote(failurePreview, '> _no failure detail available_'),
    ].join('\n'),
    fields: [{ name: '🆔 Review', value: params.reviewId }],
    footer: { text: 'MacGamingDB moderation' },
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
            style: BUTTON_STYLE_LINK,
            label: 'View review',
            url: params.reviewUrl,
          },
        ],
      },
    ],
  };
};
