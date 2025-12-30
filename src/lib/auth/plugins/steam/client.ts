import type { steamAuthPlugin } from './index';
import type { BetterAuthClientPlugin } from 'better-auth';

export const steamAuthClient = () => {
  return {
    id: 'steam-auth',
    $InferServerPlugin: {} as ReturnType<typeof steamAuthPlugin>,
  } satisfies BetterAuthClientPlugin;
};