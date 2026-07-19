import { isNonEmptyString } from '@sniptt/guards';
import {
  ModerationVerdictSchema,
  type ModerationVerdict,
} from '../../../dtos/moderation-verdict.dto';

const extractJsonObject = (content: string): string | undefined => {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return undefined;
  }
  return content.slice(start, end + 1);
};

export const parseModerationVerdict = (
  content: string,
): ModerationVerdict | undefined => {
  const jsonText = extractJsonObject(content);
  if (!isNonEmptyString(jsonText)) {
    return undefined;
  }

  try {
    const result = ModerationVerdictSchema.safeParse(JSON.parse(jsonText));
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
};
