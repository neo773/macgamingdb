import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { GameModule } from '../game/game.module';
import { ReviewService } from './services/review.service';
import { ReviewRouter } from './routers/review.router';

@Module({
  imports: [GameModule],
  providers: [ReviewService, ReviewRouter, AuthMiddleware],
  exports: [ReviewService],
})
export class ReviewModule {}
