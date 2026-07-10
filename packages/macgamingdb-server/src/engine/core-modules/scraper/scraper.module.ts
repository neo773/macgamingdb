import { Module } from '@nestjs/common';
import { WebScraperService } from './services/web-scraper.service';

@Module({
  providers: [WebScraperService],
  exports: [WebScraperService],
})
export class ScraperModule {}
