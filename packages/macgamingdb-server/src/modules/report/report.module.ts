import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../../engine/api/trpc/auth.middleware';
import { ReviewModule } from '../review/review.module';
import { MODERATION_LLM } from './constants/moderation-llm.constant';
import { DiscordInteractionController } from './controllers/discord-interaction.controller';
import { DiscordInteractionService } from './drivers/discord/services/discord-interaction.service';
import { DiscordMessageService } from './drivers/discord/services/discord-message.service';
import { OpenRouterModerationService } from './drivers/openrouter/services/openrouter-moderation.service';
import { ReportSubmittedListener } from './listeners/report-submitted.listener';
import { ReviewCreatedListener } from './listeners/review-created.listener';
import { ReportRouter } from './routers/report.router';
import { ReportService } from './services/report.service';

@Module({
  imports: [ReviewModule],
  controllers: [DiscordInteractionController],
  providers: [
    ReportService,
    ReportRouter,
    AuthMiddleware,
    DiscordMessageService,
    DiscordInteractionService,
    ReviewCreatedListener,
    ReportSubmittedListener,
    { provide: MODERATION_LLM, useClass: OpenRouterModerationService },
  ],
})
export class ReportModule {}
