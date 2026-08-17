import { isNonEmptyString } from '@sniptt/guards';
import { INTERNAL_REQUEST_SECRET_HEADER } from '../../../api/constants/internal-request-secret-header.constant';
import { fetchWithRetryOrThrow } from '../../http/utils/fetch-with-retry-or-throw.util';
import {
  INTERNAL_EMAIL_MAX_ATTEMPTS,
  INTERNAL_EMAIL_REQUEST_TIMEOUT_MS,
} from '../constants/internal-email-request.constant';
import { EmailException } from '../exceptions/email.exception';

type SendEmailViaApiParams = {
  path: 'magic-link' | 'verification-otp';
  payload: Record<string, string>;
};

export const sendEmailViaApiOrThrow = async ({
  path,
  payload,
}: SendEmailViaApiParams): Promise<void> => {
  const internalApiUrl = process.env.INTERNAL_API_URL;
  const internalApiSecret = process.env.INTERNAL_API_SECRET;

  if (!isNonEmptyString(internalApiUrl)) {
    throw new EmailException(
      'INTERNAL_API_URL is not configured',
      'EMAIL_MISCONFIGURED',
    );
  }

  if (!isNonEmptyString(internalApiSecret)) {
    throw new EmailException(
      'INTERNAL_API_SECRET is not configured',
      'EMAIL_MISCONFIGURED',
    );
  }

  const response = await fetchWithRetryOrThrow({
    url: `${internalApiUrl}/emails/${path}`,
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [INTERNAL_REQUEST_SECRET_HEADER]: internalApiSecret,
      },
      body: JSON.stringify(payload),
    },
    timeoutMs: INTERNAL_EMAIL_REQUEST_TIMEOUT_MS,
    maxAttempts: INTERNAL_EMAIL_MAX_ATTEMPTS,
  });

  if (!response.ok) {
    throw new EmailException(
      `Email API rejected "${path}" with status ${response.status}`,
      'EMAIL_DISPATCH_FAILED',
    );
  }
};
