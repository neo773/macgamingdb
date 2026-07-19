import { CONFIDENCE_BAR_SEGMENTS } from '../constants/discord-message.constant';

export const buildConfidenceBar = (confidence: number): string => {
  const filled = Math.round(confidence * CONFIDENCE_BAR_SEGMENTS);
  const bar =
    '▰'.repeat(filled) + '▱'.repeat(CONFIDENCE_BAR_SEGMENTS - filled);
  return `${bar} ${Math.round(confidence * 100)}%`;
};
