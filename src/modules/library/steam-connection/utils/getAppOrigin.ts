export function getAppOrigin(): string {
  if (process.env.STEAM_OPENID_REALM) return process.env.STEAM_OPENID_REALM;
  return process.env.NODE_ENV === 'production'
    ? 'https://macgamingdb.app'
    : 'https://macgamingdb.local';
}
