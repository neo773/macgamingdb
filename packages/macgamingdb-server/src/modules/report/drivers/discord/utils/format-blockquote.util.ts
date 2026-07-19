import { isNonEmptyString } from '@sniptt/guards';

export const formatBlockquote = (text: string, fallback: string): string => {
  if (!isNonEmptyString(text.trim())) {
    return fallback;
  }
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
};
