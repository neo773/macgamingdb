import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ModerationVerdictSchema,
  type ModerationVerdict,
} from '../../../dtos/moderation-verdict.dto';
import { ReportException } from '../../../exceptions/report.exception';
import { type JudgeReviewParams } from '../../../types/judge-review-params.type';
import { type ModerationLlm } from '../../../types/moderation-llm.type';
import { buildModerationPrompt } from '../utils/build-moderation-prompt.util';

const OPENROUTER_COMPLETIONS_URL =
  'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
const MAX_ATTEMPTS = 2;

const completionResponseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string() }) }))
    .min(1),
});

const extractJsonObject = (content: string): string | undefined => {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return undefined;
  }
  return content.slice(start, end + 1);
};

@Injectable()
export class OpenRouterModerationService implements ModerationLlm {
  async judgeReview(params: JudgeReviewParams): Promise<ModerationVerdict> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!isNonEmptyString(apiKey)) {
      throw new ReportException(
        'OPENROUTER_API_KEY is not configured',
        'MODERATION_MISCONFIGURED',
      );
    }

    const model = process.env.MODERATION_MODEL ?? DEFAULT_MODEL;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const content = await this.requestCompletion({ apiKey, model, params });
      const verdict = this.parseVerdict(content);
      if (verdict) {
        return verdict;
      }
    }

    throw new ReportException(
      'Moderation model returned invalid output',
      'MODERATION_FAILED',
    );
  }

  private async requestCompletion(params: {
    apiKey: string;
    model: string;
    params: JudgeReviewParams;
  }): Promise<string> {
    const response = await fetch(OPENROUTER_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: buildModerationPrompt(params.params),
      }),
    });

    if (!response.ok) {
      throw new ReportException(
        `OpenRouter request failed with status ${response.status}`,
        'MODERATION_FAILED',
      );
    }

    const parsed = completionResponseSchema.safeParse(await response.json());
    if (!parsed.success) {
      throw new ReportException(
        'OpenRouter response had an unexpected shape',
        'MODERATION_FAILED',
      );
    }

    return parsed.data.choices[0].message.content;
  }

  private parseVerdict(content: string): ModerationVerdict | undefined {
    const jsonText = extractJsonObject(content);
    if (!isNonEmptyString(jsonText)) {
      return undefined;
    }

    try {
      const verdict = ModerationVerdictSchema.safeParse(JSON.parse(jsonText));
      return verdict.success ? verdict.data : undefined;
    } catch {
      return undefined;
    }
  }
}
