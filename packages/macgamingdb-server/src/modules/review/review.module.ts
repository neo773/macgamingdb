import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { ReviewService } from './services/review.service';
import { ReviewRouter } from './routers/review.router';

@Module({
  providers: [ReviewService, ReviewRouter, AuthMiddleware],
})
export class ReviewModule {}
