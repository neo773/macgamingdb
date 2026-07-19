import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { isNonEmptyString } from '@sniptt/guards';
import { type ModerationVerdict } from '../../../dtos/moderation-verdict.dto';
import { ReportException } from '../../../exceptions/report.exception';
import { type JudgeReviewParams } from '../../../types/judge-review-params.type';
import { type ModerationLlm } from '../../../types/moderation-llm.type';
import {
  DEFAULT_MODERATION_MODEL,
  MODERATION_MAX_ATTEMPTS,
  OPENROUTER_COMPLETIONS_URL,
  WEB_SEARCH_MAX_RESULTS,
} from '../constants/openrouter-request.constant';
import { buildModerationPrompt } from '../utils/build-moderation-prompt.util';
import { parseModerationVerdict } from '../utils/parse-moderation-verdict.util';

const completionResponseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string() }) }))
    .min(1),
});

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

    const model = process.env.MODERATION_MODEL ?? DEFAULT_MODERATION_MODEL;

    for (const useWebSearch of [true, false]) {
      try {
        for (let attempt = 0; attempt < MODERATION_MAX_ATTEMPTS; attempt++) {
          const content = await this.requestCompletion({
            apiKey,
            model,
            params,
            useWebSearch,
          });
          const verdict = parseModerationVerdict(content);
          if (verdict) {
            return verdict;
          }
        }
      } catch {
        // Web-search request failed (plugin/billing/model) — fall back to a text-only attempt.
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
    useWebSearch: boolean;
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
        ...(params.useWebSearch
          ? { plugins: [{ id: 'web', max_results: WEB_SEARCH_MAX_RESULTS }] }
          : {}),
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
}
