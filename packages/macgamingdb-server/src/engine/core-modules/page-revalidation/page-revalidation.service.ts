import { Injectable, Logger } from '@nestjs/common';

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
      await fetch(`${webAppUrl}/api/revalidate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-revalidate-secret': secret,
        },
        body: JSON.stringify({ paths }),
      });
    } catch (error) {
      this.logger.warn(
        `Page revalidation failed for ${paths.join(', ')}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
