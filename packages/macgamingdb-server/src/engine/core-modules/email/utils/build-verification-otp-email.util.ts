import { type VerificationOtpEmailContent } from '../types/verification-otp-email-content.type';

export const buildVerificationOtpEmail = ({
  otp,
}: {
  otp: string;
}): VerificationOtpEmailContent => ({
  subject: `${otp} is your MacGamingDB verification code`,
  text: [
    `Your MacGamingDB verification code is: ${otp}`,
    '',
    'It expires in 10 minutes. If you did not request this, you can ignore this email.',
    '',
    `@macgamingdb.app #${otp}`,
  ].join('\n'),
});
