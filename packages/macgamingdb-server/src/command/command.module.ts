import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MacConfigModule } from '../modules/mac-config/mac-config.module';
import { BackfillReviewCountsCommand } from '../modules/review/commands/backfill-review-counts.command';
import { BackfillAggregatedPerformanceCommand } from '../modules/review/commands/backfill-aggregated-performance.command';
import { BackfillGameSlugsCommand } from '../modules/game/commands/backfill-game-slugs.command';
import { BackfillGameGenresCommand } from '../modules/game/commands/backfill-game-genres.command';
import { BackfillCriticRatingsCommand } from '../modules/game/commands/backfill-critic-ratings.command';
import { BackfillGameGenresFromSteamTagsCommand } from '../modules/game/commands/backfill-game-genres-from-steam-tags.command';
import { SteamStoreTagsService } from '../modules/game/drivers/steam/services/steam-store-tags.service';
import { GameSlugBackfillService } from '../modules/game/services/game-slug-backfill.service';
import { IgdbApiClientService } from '../modules/game/drivers/igdb/services/igdb-api-client.service';
import { MigrateDatabaseCommand } from '../database/commands/migrate-database.command';

@Module({
  imports: [DatabaseModule, MacConfigModule],
  providers: [
    GameSlugBackfillService,
    IgdbApiClientService,
    SteamStoreTagsService,
    BackfillReviewCountsCommand,
    BackfillAggregatedPerformanceCommand,
    BackfillGameSlugsCommand,
    BackfillGameGenresCommand,
    BackfillCriticRatingsCommand,
    BackfillGameGenresFromSteamTagsCommand,
    MigrateDatabaseCommand,
  ],
})
export class CommandModule {}
