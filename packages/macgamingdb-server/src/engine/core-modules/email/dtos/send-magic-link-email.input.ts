import { z } from 'zod';

export const sendMagicLinkEmailInput = z.object({
  email: z.string().email(),
  magicLink: z.string().url(),
});
