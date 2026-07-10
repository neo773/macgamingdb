import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MacConfigModule } from '../modules/mac-config/mac-config.module';
import { BackfillReviewCountsCommand } from '../modules/review/commands/backfill-review-counts.command';
import { BackfillAggregatedPerformanceCommand } from '../modules/review/commands/backfill-aggregated-performance.command';
import { BackfillGameSlugsCommand } from '../modules/game/commands/backfill-game-slugs.command';
import { GameSlugBackfillService } from '../modules/game/services/game-slug-backfill.service';
import { MigrateDatabaseCommand } from '../database/commands/migrate-database.command';

@Module({
  imports: [DatabaseModule, MacConfigModule],
  providers: [
    GameSlugBackfillService,
    BackfillReviewCountsCommand,
    BackfillAggregatedPerformanceCommand,
    BackfillGameSlugsCommand,
    MigrateDatabaseCommand,
  ],
})
export class CommandModule {}
