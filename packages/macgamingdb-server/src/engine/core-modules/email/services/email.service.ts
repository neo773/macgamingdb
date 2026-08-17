import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { render } from '@react-email/render';
import {
  MacGamingDBMagicLinkEmail,
  MacGamingDBMagicLinkEmailText,
} from 'macgamingdb-emails/magic-link';
import { fetchWithRetryOrThrow } from '../../http/utils/fetch-with-retry-or-throw.util';
import {
  EMAIL_FROM_ADDRESS,
  EMAIL_REPLY_TO_ADDRESS,
  MAGIC_LINK_EMAIL_SUBJECT,
  RESEND_EMAILS_URL,
  RESEND_REQUEST_TIMEOUT_MS,
} from '../constants/resend-request.constant';
import { EmailException } from '../exceptions/email.exception';
import { type SendMagicLinkEmailParams } from '../types/send-magic-link-email-params.type';
import { type SendVerificationOtpEmailParams } from '../types/send-verification-otp-email-params.type';
import { buildVerificationOtpEmail } from '../utils/build-verification-otp-email.util';

type ResendEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class EmailService {
  async sendMagicLinkEmail({
    email,
    magicLink,
  }: SendMagicLinkEmailParams): Promise<void> {
    const html = await render(MacGamingDBMagicLinkEmail({ magicLink }));

    await this.sendOrThrow({
      to: email,
      subject: MAGIC_LINK_EMAIL_SUBJECT,
      text: MacGamingDBMagicLinkEmailText({ magicLink }),
      html,
    });
  }

  async sendVerificationOtpEmail({
    email,
    otp,
  }: SendVerificationOtpEmailParams): Promise<void> {
    const { subject, text } = buildVerificationOtpEmail({ otp });

    await this.sendOrThrow({ to: email, subject, text });
  }

  private async sendOrThrow(payload: ResendEmailPayload): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!isNonEmptyString(apiKey)) {
      throw new EmailException(
        'RESEND_API_KEY is not configured',
        'EMAIL_MISCONFIGURED',
      );
    }

    const response = await fetchWithRetryOrThrow({
      url: RESEND_EMAILS_URL,
      init: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: EMAIL_FROM_ADDRESS,
          reply_to: EMAIL_REPLY_TO_ADDRESS,
          ...payload,
        }),
      },
      timeoutMs: RESEND_REQUEST_TIMEOUT_MS,
    });

    if (!response.ok) {
      throw new EmailException(
        `Resend rejected "${payload.subject}" with status ${response.status}`,
        'EMAIL_DISPATCH_FAILED',
      );
    }
  }
}
