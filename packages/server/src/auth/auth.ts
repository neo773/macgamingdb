import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { magicLink } from 'better-auth/plugins/magic-link';
import { Resend } from 'resend';
import {
  MacGamingDBMagicLinkEmail,
  MacGamingDBMagicLinkEmailText,
} from '@macgamingdb/emails/magic-link';
import { type PrismaClient } from '../generated/prisma/client';

export const BetterAuthClient = (prisma: PrismaClient) => {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, token, url }) => {
          console.log(
            `Sending magic link to ${email} with token ${token} and url ${url}`,
          );

          if (process.env.NODE_ENV !== 'production') {
            return;
          }
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: 'MacGamingDB <hello@macgamingdb.app>',
            replyTo: 'support@macgamingdb.app',
            to: email,
            subject: 'Log in to MacGamingDB with this magic link',
            react: MacGamingDBMagicLinkEmail({ magicLink: url }),
            text: MacGamingDBMagicLinkEmailText({ magicLink: url }),
          });
        },
      }),
    ],
  });
};

export type BetterAuthClientType = ReturnType<typeof BetterAuthClient>;
