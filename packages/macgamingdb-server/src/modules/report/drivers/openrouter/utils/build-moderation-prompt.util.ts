import { isNonEmptyArray } from '@sniptt/guards';
import { type JudgeReviewParams } from '../../../types/judge-review-params.type';

type ModerationMessage = {
  role: 'system' | 'user';
  content: string;
};

const SYSTEM_PROMPT = [
  'You are a content moderator for MacGamingDB, a database of user-submitted reports on how PC games run on Apple Silicon Macs.',
  'A report may be bad for two reasons:',
  '1. SPAM — advertising, unrelated promotion, gibberish, scams, or abusive filler with no genuine information.',
  '2. INACCURATE — the report contradicts known facts about the game or is technically impossible.',
  '',
  'Key rules for this domain:',
  '- playMethod NATIVE means the game ships a real macOS / Apple Silicon build. NATIVE for a game with no native Mac version is almost certainly false.',
  '- Translation layers (DXVK, DXMT, D3D_METAL) only run a WINDOWS build under CrossOver / Parallels / Wine. NATIVE combined with a translation layer is contradictory.',
  '- Impossible hardware/performance claims (e.g. absurd or negative fps) are inaccurate.',
  '- Do NOT assume a game is Windows-only from memory — new Mac ports ship constantly. Web search results about the game are provided below; rely on them to judge whether a genuine native macOS / Apple Silicon build exists before judging any NATIVE claim. If the results are empty or inconclusive, prefer "uncertain" over guessing.',
  '',
  'Judge only clear problems. Genuine but terse, opinionated, or low-detail reports are OK.',
  'Respond with a single JSON object and nothing else, matching exactly:',
  '{"verdict":"flag"|"ok"|"uncertain","category":"spam"|"inaccurate"|"other"|"none","confidence":<0..1>,"rationale":"<one short sentence>"}',
  'Use category "none" when verdict is "ok".',
].join('\n');

const formatList = (values?: string[]): string | undefined =>
  isNonEmptyArray(values) ? values.join(', ') : undefined;

export const buildModerationPrompt = (
  params: JudgeReviewParams,
  webContext: string[],
): ModerationMessage[] => {
  const { game, review } = params;

  const webSection = isNonEmptyArray(webContext)
    ? ['', 'WEB SEARCH RESULTS', ...webContext.map((snippet) => `- ${snippet}`)]
    : ['', 'WEB SEARCH RESULTS', '(no results found)'];

  const lines = [
    'GAME',
    `Name: ${game.name}`,
    game.developers && `Developers: ${formatList(game.developers)}`,
    game.publishers && `Publishers: ${formatList(game.publishers)}`,
    game.genres && `Genres: ${formatList(game.genres)}`,
    game.releaseYear && `Release year: ${game.releaseYear}`,
    game.website && `Website: ${game.website}`,
    '',
    'REPORT',
    `Play method: ${review.playMethod}`,
    review.translationLayer && `Translation layer: ${review.translationLayer}`,
    `Performance rating: ${review.performance}`,
    review.fps !== undefined && `FPS: ${review.fps}`,
    review.graphicsSettings && `Graphics settings: ${review.graphicsSettings}`,
    review.resolution && `Resolution: ${review.resolution}`,
    `Chipset: ${review.chipset} ${review.chipsetVariant}`,
    review.softwareVersion && `Software version: ${review.softwareVersion}`,
    params.reportReason && `Reported as: ${params.reportReason}`,
    `Notes: ${review.notes ?? '(none)'}`,
    ...webSection,
  ].filter((line): line is string => typeof line === 'string');

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: lines.join('\n') },
  ];
};
