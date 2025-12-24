export interface ScrapingResponse {
  results: Array<{
    content: string;
    status_code: number;
    url: string;
  }>;
}

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

export class WebScraper {
  constructor(private readonly apiCredentials: string) {}
  public static readonly apiEndpoint = 'https://realtime.oxylabs.io/v1/queries';

  async fetchPageContent(url: string): Promise<string> {
    try {
      const response = await fetch(WebScraper.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(this.apiCredentials)}`,
        },
        body: JSON.stringify({
          source: 'universal',
          url: url,
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
