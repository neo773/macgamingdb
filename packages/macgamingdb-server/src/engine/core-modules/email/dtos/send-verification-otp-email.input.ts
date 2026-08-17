import { z } from 'zod';

export const sendVerificationOtpEmailInput = z.object({
  email: z.string().email(),
  otp: z.string().min(1),
});
