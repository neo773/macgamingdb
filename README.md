# MacGamingDB

A community-driven database for gaming performance on Apple Silicon Macs.

MacGamingDB allows users to search for games and see how well they run on different Mac models with Apple Silicon chips (M1, M2, M3, M4). Users can contribute their own performance reviews, helping the community make informed decisions about game compatibility and performance.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Authentication**: BetterAuth
- **Database**: 
  - Prisma ORM
  - SQLite (Development)
  - Turso (LibSQL) for production
- **API Layer**: tRPC for type-safe APIs
- **External APIs**:
  - Steam API for game data
- **Styling**: Tailwind CSS
- **Components**: Custom components with Shadcn UI
- **Email**: 
  - Resend for email communications
  - React Email for email templates

## Project Structure

```
macgamingdb/
├── src/                     
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and hooks
│   │   ├── auth/            # Authentication utilities
│   │   ├── database/        # Database client and helpers
│   │   ├── hooks/           # Custom React hooks
│   │   └── igdb/            # IGDB API integration
│   ├── server/              # Server-side code
│   │   ├── helpers/         # Server utility functions
│   │   ├── routers/         # tRPC routers
│   │   └── schema/          # Schema definitions
├── prisma/                  # Prisma ORM configuration and schema
```

## Development

1. Clone the repository
2. Install dependencies: `bun install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `bun run dev`
