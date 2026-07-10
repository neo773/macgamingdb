import { Module } from '@nestjs/common';
import { ScraperModule } from '../../engine/core-modules/scraper/scraper.module';
import { EveryMacScraperService } from './drivers/everymac/services/everymac-scraper.service';
import { PopulateMacConfigsCommand } from './commands/populate-mac-configs.command';

@Module({
  imports: [ScraperModule],
  providers: [EveryMacScraperService, PopulateMacConfigsCommand],
})
export class MacConfigModule {}
