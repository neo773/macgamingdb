/**
 * Public-facing origin for this app. Used to build absolute redirect URLs that
 * survive reverse-proxy hops (e.g. Caddy → http://localhost:3000), where
 * `req.url` would otherwise leak the internal host.
 */
export function getPublicOrigin(): string {
  if (process.env.STEAM_OPENID_REALM) return process.env.STEAM_OPENID_REALM;
  return process.env.NODE_ENV === 'production'
    ? 'https://macgamingdb.app'
    : 'https://macgamingdb.local';
}
