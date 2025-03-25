# Mac Gaming DB

A database of games for Mac with performance ratings and user experiences.

## tRPC Migration

This project has been migrated to use tRPC for type-safe API endpoints. The migration includes:

1. Setting up the tRPC server with proper context
2. Creating routers for games and reviews
3. Implementing client-side tRPC provider
4. Updating components to use tRPC hooks
5. Adding Server-Side Rendering (SSR) support

### Project Structure

- `/src/server/trpc.ts` - tRPC server configuration
- `/src/server/routers/_app.ts` - Root router that combines all routers
- `/src/server/routers/game.ts` - Game-related queries
- `/src/server/routers/review.ts` - Review-related mutations
- `/src/lib/trpc/provider.tsx` - Client-side tRPC provider with SSR support
- `/src/lib/trpc/utils.ts` - Utility functions for tRPC
- `/src/lib/trpc/server.ts` - Server-side helpers for SSR
- `/src/app/api/trpc/[trpc]/route.ts` - Next.js API route handler

### Client-Side Usage

Components can use tRPC hooks for data fetching:

```tsx
// Example: Fetch game data
const { data, isLoading } = trpc.game.getById.useQuery({ id });

// Example: Submit a review
const { mutate: createReview } = trpc.review.create.useMutation();
```

### Server-Side Rendering

Server components can use tRPC server helpers:

```tsx
// Example: Use in a Server Component
import { createServerHelpers } from '@/lib/trpc/server';

export default async function MyServerComponent() {
  const helpers = createServerHelpers();
  
  // Prefetch data
  await helpers.game.getById.prefetch({ id: '123' });
  
  // Use fetched data
  const { game } = await helpers.game.getById.fetch({ id: '123' });
  
  return <div>{game.name}</div>;
}
```

### Benefits

- Type-safe API calls with full TypeScript integration
- Automatic type inference between client and server
- Simplified data fetching with React Query under the hood
- Improved error handling and loading states
- Server-Side Rendering (SSR) for better performance and SEO

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
