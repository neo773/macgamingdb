import {
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
  UnauthorizedException,
  type RawBodyRequest,
} from '@nestjs/common';
import { type Request } from 'express';
import { DiscordInteractionService } from '../drivers/discord/services/discord-interaction.service';
import { ReportException } from '../exceptions/report.exception';

@Controller('discord')
export class DiscordInteractionController {
  private readonly logger = new Logger(DiscordInteractionController.name);

  constructor(
    private readonly discordInteractionService: DiscordInteractionService,
  ) {}

  @Post('interactions')
  @HttpCode(200)
  async handleInteraction(
    @Req() request: RawBodyRequest<Request>,
    @Headers('x-signature-ed25519') signature?: string,
    @Headers('x-signature-timestamp') timestamp?: string,
  ) {
    this.logger.log(
      `interaction hit: hasSig=${!!signature} hasTs=${!!timestamp} bytes=${
        request.rawBody?.length ?? 0
      }`,
    );
    const rawBody = request.rawBody;
    if (!rawBody) {
      throw new UnauthorizedException('Missing request body');
    }

    try {
      return await this.discordInteractionService.verifyAndHandle({
        rawBody,
        signature,
        timestamp,
      });
    } catch (error) {
      if (
        error instanceof ReportException &&
        error.code === 'DISCORD_SIGNATURE_INVALID'
      ) {
        throw new UnauthorizedException('Invalid request signature');
      }
      throw error;
    }
  }
}
