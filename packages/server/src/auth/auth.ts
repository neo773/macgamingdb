import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins/magic-link';
import { expo } from '@better-auth/expo';
import { Resend } from 'resend';
import { SignJWT, importPKCS8 } from 'jose';
import {
  MacGamingDBMagicLinkEmail,
  MacGamingDBMagicLinkEmailText,
} from '@macgamingdb/emails/magic-link';
import { type DrizzleDB } from '../database/drizzle';
import * as schema from '../drizzle/schema';

async function generateAppleClientSecret(): Promise<string> {
  const teamId = process.env.APPLE_TEAM_ID!;
  const clientId = process.env.APPLE_CLIENT_ID!;
  const keyId = process.env.APPLE_KEY_ID!;
  const privateKey = (process.env.APPLE_PRIVATE_KEY!).replace(/\\n/g, '\n');

  const key = await importPKCS8(privateKey, 'ES256');

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime('180d')
    .setAudience('https://appleid.apple.com')
    .setSubject(clientId)
    .sign(key);
}

export const BetterAuthClient = async (db: DrizzleDB): Promise<ReturnType<typeof betterAuth>> => {
  const appleClientSecret = await generateAppleClientSecret();

  return betterAuth({
    baseURL:
      process.env.NODE_ENV === 'production'
        ? 'https://macgamingdb.app'
        : 'http://macgamingdb.local',
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
      usePlural: true,
    }),
    socialProviders: {
      apple: {
        clientId: process.env.APPLE_CLIENT_ID as string,
        clientSecret: appleClientSecret,
        appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
      },
    },
    trustedOrigins: [
      'macgamingdb://',
      'exp://',
      'http://localhost:8081',
      'http://macgamingdb.local',
      'https://macgamingdb.app',
      'https://appleid.apple.com',
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

export type BetterAuthClientType = Awaited<ReturnType<typeof BetterAuthClient>>;
