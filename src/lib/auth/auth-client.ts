'use client';

import { createAuthClient } from 'better-auth/react';

import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://macgamingdb.app'
      : 'http://localhost:3000',
  plugins: [magicLinkClient()],
});
