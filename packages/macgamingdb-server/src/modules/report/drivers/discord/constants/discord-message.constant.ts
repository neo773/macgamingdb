import { type ModerationVerdict } from '../../../dtos/moderation-verdict.dto';

type VerdictPresentation = {
  emoji: string;
  label: string;
  color: number;
};

export const DISCORD_API_BASE = 'https://discord.com/api/v10';
export const NOTES_PREVIEW_LIMIT = 1000;
export const CONFIDENCE_BAR_SEGMENTS = 10;
export const EMBED_DIVIDER = '━━━━━━━━━━━━━━━━━━━━━━━━━━';
export const ZERO_WIDTH_SPACE = '​';

export const ACTION_ROW_TYPE = 1;
export const BUTTON_TYPE = 2;
export const BUTTON_STYLE_DANGER = 4;
export const BUTTON_STYLE_SECONDARY = 2;
export const BUTTON_STYLE_LINK = 5;

export const VERDICT_PRESENTATION: Record<
  ModerationVerdict['verdict'],
  VerdictPresentation
> = {
  flag: { emoji: '🚩', label: 'Flagged', color: 0xed4245 },
  ok: { emoji: '✅', label: 'Looks OK', color: 0x57f287 },
  uncertain: { emoji: '🤔', label: 'Uncertain', color: 0xfee75c },
};

export const CATEGORY_LABEL: Record<ModerationVerdict['category'], string> = {
  spam: '🗑️ Spam',
  inaccurate: '❌ Inaccurate',
  other: '⚠️ Other',
  none: '➖ None',
};
