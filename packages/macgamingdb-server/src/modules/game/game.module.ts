import { Module } from '@nestjs/common';
import { PricingModule } from '../pricing/pricing.module';
import { GameService } from './services/game.service';
import { GameSearchService } from './services/game-search.service';
import { GameMaterializationService } from './services/game-materialization.service';
import { SteamGameSourceService } from './drivers/steam/services/steam-game-source.service';
import { IgdbApiClientService } from './drivers/igdb/services/igdb-api-client.service';
import { IgdbGameSourceService } from './drivers/igdb/services/igdb-game-source.service';
import { GameRouter } from './routers/game.router';

@Module({
  imports: [PricingModule],
  providers: [
    GameService,
    GameSearchService,
    GameMaterializationService,
    SteamGameSourceService,
    IgdbApiClientService,
    IgdbGameSourceService,
    GameRouter,
  ],
  exports: [GameMaterializationService],
})
export class GameModule {}
