import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameRouter } from './routers/game.router';

@Module({
  providers: [GameService, GameRouter],
})
export class GameModule {}
