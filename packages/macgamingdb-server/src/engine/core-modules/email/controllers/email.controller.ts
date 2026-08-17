import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InternalRequestGuard } from '../../../api/guards/internal-request.guard';
import { sendMagicLinkEmailInput } from '../dtos/send-magic-link-email.input';
import { sendVerificationOtpEmailInput } from '../dtos/send-verification-otp-email.input';
import { EmailService } from '../services/email.service';

@Controller('emails')
@UseGuards(InternalRequestGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('magic-link')
  @HttpCode(204)
  async sendMagicLink(@Body() body: unknown): Promise<void> {
    const parsedBody = sendMagicLinkEmailInput.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException('Invalid magic link email payload');
    }

    await this.emailService.sendMagicLinkEmail(parsedBody.data);
  }

  @Post('verification-otp')
  @HttpCode(204)
  async sendVerificationOtp(@Body() body: unknown): Promise<void> {
    const parsedBody = sendVerificationOtpEmailInput.safeParse(body);

    if (!parsedBody.success) {
      throw new BadRequestException('Invalid verification OTP email payload');
    }

    await this.emailService.sendVerificationOtpEmail(parsedBody.data);
  }
}
