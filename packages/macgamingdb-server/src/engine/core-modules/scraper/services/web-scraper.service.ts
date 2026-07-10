import { Injectable } from '@nestjs/common';
import { OXYLABS_API_ENDPOINT } from '../constants/oxylabs-api-endpoint.constant';

type ScrapingResponse = {
  results: Array<{
    content: string;
  }>;
};

class ScrapingError extends Error {
  constructor(
    message: string,
    public readonly url?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ScrapingError';
  }
}

@Injectable()
export class WebScraperService {
  async fetchPageContent(url: string): Promise<string> {
    const apiCredentials = process.env.OXYLABS_API_CREDENTIALS;

    if (!apiCredentials) {
      throw new ScrapingError(
        'Missing OXYLABS_API_CREDENTIALS environment variable',
        url,
      );
    }

    try {
      const response = await fetch(OXYLABS_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(apiCredentials)}`,
        },
        body: JSON.stringify({
          source: 'universal',
          url,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ScrapingResponse = await response.json();

      if (!data.results?.[0]?.content) {
        throw new Error('No content received from scraping service');
      }

      return data.results[0].content;
    } catch (error) {
      throw new ScrapingError(`Failed to scrape ${url}`, url, error);
    }
  }
}
