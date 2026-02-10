import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins/magic-link';
import { expo } from '@better-auth/expo';
import { Resend } from 'resend';
import {
  MacGamingDBMagicLinkEmail,
  MacGamingDBMagicLinkEmailText,
} from '@macgamingdb/emails/magic-link';
import { type DrizzleDB } from '../database/drizzle';

export const BetterAuthClient = (db: DrizzleDB) => {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    trustedOrigins: [
      'macgamingdb://',
      'exp://',
      'http://localhost:8081',
      'http://macgamingdb.local',
      'https://macgamingdb.app',
    ],
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      expo(),
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
