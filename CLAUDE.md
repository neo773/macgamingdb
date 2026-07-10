# MacGamingDB

Monorepo: Next.js web app (`src/`) + NestJS tRPC API (`packages/macgamingdb-server`, port 4000) + UI primitives (`packages/macgamingdb-ui`) + emails (`packages/macgamingdb-emails`). Bun workspaces.

**Read `CODE_STYLE.md` before writing any code. Its rules are hard lines, not suggestions.**

- Dev: `bun run dev:server` (API on :4000) + `bun run dev` (Next; falls back past :3000 if occupied — never kill what holds :3000).
- Verify: `bunx tsc --noEmit` at root AND in `packages/macgamingdb-server`; `bun run test`; `bun run lint`.
- DB: drizzle; local db at `packages/macgamingdb-server/prisma/dev.db`; migrations via `bun run db:generate` / `db:migrate`. Never run anything against `.env.prod` unprompted.
- OpenAPI for the iOS app: `bun --bun scripts/generate-openapi.ts` after router/dto changes.
- Do not commit `MobileAppSwift/` or `TWENTY_*_CONVENTIONS.md`.
