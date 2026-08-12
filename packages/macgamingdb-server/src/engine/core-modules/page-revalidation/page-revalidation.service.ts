import { Injectable, Logger } from '@nestjs/common';
import { fetchWithRetryOrThrow } from '../http/utils/fetch-with-retry-or-throw.util';

const REVALIDATION_REQUEST_TIMEOUT_MS = 5_000;

@Injectable()
export class PageRevalidationService {
  private readonly logger = new Logger(PageRevalidationService.name);

  async revalidatePaths({ paths }: { paths: string[] }): Promise<void> {
    const webAppUrl = process.env.WEB_APP_URL;
    const secret = process.env.REVALIDATE_SECRET;

    if (!webAppUrl || !secret) {
      return;
    }

    try {
      await fetchWithRetryOrThrow({
        url: `${webAppUrl}/api/revalidate`,
        init: {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-revalidate-secret': secret,
          },
          body: JSON.stringify({ paths }),
        },
        timeoutMs: REVALIDATION_REQUEST_TIMEOUT_MS,
      });
    } catch (error) {
      this.logger.warn(
        `Page revalidation failed for ${paths.join(', ')}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
