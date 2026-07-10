# MacGamingDB

A community-driven database for gaming performance on Apple Silicon Macs.

[MacGamingDB](https://macgamingdb.app/) lets users search for games and see how well they run on different Mac models with Apple Silicon chips (M1–M4). Users contribute performance reviews — FPS, play method (Native, CrossOver, Parallels, GPTK), graphics settings — keyed to specific Mac configurations. Games come from both Steam and IGDB, so console-first and non-Steam titles are covered too.

<img width="800" alt="Screenshot" src="https://github.com/user-attachments/assets/ff91d46b-aecf-445d-8158-7fc66c52bf40" />

## Architecture

Two deployable services plus shared workspace packages. Bun is the package manager; everything runs on Node.js.

| Piece | What it is |
|---|---|
| `src/` | Next.js 16 web app (App Router). Thin routes; all feature logic in `src/modules/<domain>/`. Proxies `/api/trpc` and `/api/rest` to the API server. |
| `packages/macgamingdb-server` | NestJS API server using nestjs-trpc. `engine/` (infrastructure) vs `modules/` (domains: game, review, contributor, library, mac-config, pricing, traffic). External vendors live behind `drivers/` (Steam, IGDB, GG.deals, EveryMac). Serves tRPC at `/trpc` and a REST surface at `/rest` (consumed by the iOS app) on port 4000. |
| `packages/macgamingdb-ui` | Shared React primitives (shadcn/Radix + Tailwind), twenty-ui-style category folders. |
| `packages/macgamingdb-shared` | Pure cross-package utils (e.g. `isDefined`). |
| `packages/macgamingdb-emails` | React Email templates (magic link). |

- **Database**: SQLite via Drizzle ORM — local file in development, [sqld](https://github.com/tursodatabase/libsql) (libSQL server) in production. Game data is normalized into columns at ingestion; external identity lives in a `GameSourceLink` table, so one game can map to multiple stores.
- **Auth**: BetterAuth (magic link, Sign in with Apple, Steam OpenID account linking).
- **Game sources**: Steam store + IGDB (Twitch client credentials). Steam is canonical when a game exists on both.
- **Conventions**: see `CODE_STYLE.md` — hard rules, enforced.

## Development

1. Clone and install: `bun install`
2. Copy `.env.example` to `.env.local` and fill it in
3. Create the local database: `bun run db:migrate`
   - Creates `packages/macgamingdb-server/prisma/dev.db`; point `LIBSQL_DATABASE_URL` at it (`file:` URL) or leave unset to use the default path
4. Seed Mac configurations: `bun run db:seed:mac-configs`
5. Run both services:
   - `bun run dev:server` — API server on :4000
   - `bun run dev` — Next.js app (falls back past :3000 if occupied)

### Useful commands

- `bunx tsc --noEmit` (root and `packages/macgamingdb-server`) — typecheck
- `bun run test` — vitest (utils only, per conventions)
- `bun run build:api` — compile shared/emails/server packages to `dist/`
- `bun run migrate:database` — apply pending migrations + slug backfill + invariant validation (idempotent; the API container runs this on boot)
- `bun --bun scripts/generate-openapi.ts` — regenerate `openapi.json` for the iOS client after router/dto changes
- `bun run test:production-migration` — rehearse the production migration against a database snapshot

### Database changes

Edit `packages/macgamingdb-server/src/database/schema.ts`, then `bun run db:generate` to create a migration and `bun run db:migrate` to apply locally. Production applies migrations automatically on deploy; long data migrations must be written as individually-executable statements (sqld times out interactive transactions).

## Deployment

Coolify runs `docker-compose.yml` from this repo: an internal-only `api` service (`Dockerfile.api`) and the public `web` service (`Dockerfile.web`), both on `node:22-slim`. The api container self-migrates on boot and refuses to serve if validation fails. Push to `master` → Coolify builds and deploys both.
