import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { isNonEmptyString } from '@sniptt/guards';
import { fetchWithRetryOrThrow } from '../../../../../engine/core-modules/http/utils/fetch-with-retry-or-throw.util';

const EXA_SEARCH_URL = 'https://api.exa.ai/search';
const EXA_NUM_RESULTS = 4;
const EXA_MAX_CHARACTERS = 350;
const EXA_REQUEST_TIMEOUT_MS = 15_000;

const exaResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string().nullish(),
      url: z.string().nullish(),
      text: z.string().nullish(),
    }),
  ),
});

@Injectable()
export class ExaSearchService {
  async search(query: string): Promise<string[]> {
    const apiKey = process.env.EXA_API_KEY;
    if (!isNonEmptyString(apiKey)) {
      return [];
    }

    try {
      const response = await fetchWithRetryOrThrow({
        url: EXA_SEARCH_URL,
        init: {
          method: 'POST',
          headers: { 'x-api-key': apiKey, 'content-type': 'application/json' },
          body: JSON.stringify({
            query,
            numResults: EXA_NUM_RESULTS,
            type: 'auto',
            contents: { text: { maxCharacters: EXA_MAX_CHARACTERS } },
          }),
        },
        timeoutMs: EXA_REQUEST_TIMEOUT_MS,
      });

      if (!response.ok) {
        return [];
      }

      const parsed = exaResponseSchema.safeParse(await response.json());
      if (!parsed.success) {
        return [];
      }

      return parsed.data.results
        .map((result) => {
          const title = result.title ?? '';
          const text = (result.text ?? '').replace(/\s+/g, ' ').trim();
          return `${title} — ${text}`.trim();
        })
        .filter(isNonEmptyString);
    } catch {
      return [];
    }
  }
}
