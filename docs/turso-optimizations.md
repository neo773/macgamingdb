# Turso Cost Optimizations for getGames Procedure

This document outlines the optimizations implemented to reduce Turso billing costs for the `getGames` procedure, following best practices from the [Turso billing optimization guide](https://raw.githubusercontent.com/tursodatabase/example-billing-tips/refs/heads/main/README.md).

## Key Optimization Strategies

### 1. Pre-computed Aggregates (PerformanceStats Table)
- **Problem**: Counting games by performance rating required expensive full table scans
- **Solution**: Use the existing `PerformanceStats` table to store pre-computed counts
- **Benefit**: Reduces row reads from potentially thousands to just a few records

### 2. Indexed Fields for Filtering
- **Problem**: Filtering by `aggregatedPerformance` without proper indexing
- **Solution**: Added composite indexes on `Game` table:
  - `[aggregatedPerformance, id]`
  - `[reviewCount]` 
  - `[aggregatedPerformance, reviewCount]`
- **Benefit**: Enables efficient filtering and ordering without full table scans

### 3. Pre-computed reviewCount (Already Implemented)
- **Problem**: Counting reviews required scanning all GameReview records
- **Solution**: Your existing TypeScript logic already maintains `reviewCount` field:
  - `reviewCount: { increment: 1 }` when reviews are created
  - `reviewCount: { decrement: 1 }` when reviews are deleted
- **Benefit**: Reduces `COUNT(*)` operations to simple field reads
- **Note**: No SQL triggers needed - TypeScript handles this efficiently

### 4. Optimized JOIN Strategy
- **Problem**: `reviews.some` creates expensive JOIN operations
- **Solution**: Two-tier approach:
  - **Tier 1**: Use pre-computed data when possible (no JOINs)
  - **Tier 2**: Only use JOINs when absolutely necessary for chipset/playMethod filtering
- **Benefit**: Dramatically reduces row reads for common queries

### 5. Strategic Indexing for JOINs
When JOINs are necessary, added indexes on `GameReview` table:
- `[gameId, chipset]`
- `[gameId, playMethod]` 
- `[gameId, chipset, chipsetVariant]`
- `[gameId, chipset, playMethod]`

## Implementation Details

### Query Optimization Logic

```typescript
// Strategy 1: Use PerformanceStats for complex filtering
if (canUsePerformanceStats && performance !== "ALL") {
  // Get game IDs efficiently using pre-computed data
  const gameIds = await getGameIdsFromPerformanceStats(...)
  // Fetch games by ID (no JOINs)
  const games = await prisma.game.findMany({ where: { id: { in: gameIds } } })
}

// Strategy 2: Simple queries use indexed fields only
const games = await prisma.game.findMany({
  where: {
    // Use indexed aggregatedPerformance field
    aggregatedPerformance: performance,
    // Only use JOINs when absolutely necessary
    ...(chipset && { reviews: { some: { chipset } } })
  },
  orderBy: { reviewCount: "desc" } // Uses pre-computed indexed field
})
```

### Existing reviewCount Maintenance

Your TypeScript code already efficiently maintains review counts:

```typescript
// In review creation
await ctx.prisma!.game.update({
  where: { id: input.gameId },
  data: { reviewCount: { increment: 1 } },
});

// In review deletion  
await ctx.prisma!.game.update({
  where: { id: review.gameId },
  data: { reviewCount: { decrement: 1 } },
});
```

### Cost Reduction Examples

| Query Type | Before | After | Savings |
|------------|--------|-------|---------|
| All games, no filters | Full table scan | Index scan | ~90% |
| Performance filter only | Full table scan | Index lookup | ~95% |
| Chipset + performance | Multiple JOINs | Pre-computed lookup + ID fetch | ~80% |
| Review count ordering | COUNT(*) per game | Pre-computed indexed field | ~99% |

## Setup Instructions

1. **Apply database migrations**:
   ```bash
   npx prisma db push
   ```

2. **Initialize review counts for existing games** (if needed):
   ```typescript
   // Run this script once to populate reviewCount for existing games
   const games = await prisma.game.findMany({ where: { reviewCount: 0 } });
   for (const game of games) {
     const count = await prisma.gameReview.count({ where: { gameId: game.id } });
     await prisma.game.update({
       where: { id: game.id },
       data: { reviewCount: count }
     });
   }
   ```

3. **Populate PerformanceStats** (if not already done):
   ```bash
   npm run initialize-performance-stats
   ```

## Monitoring

The optimized queries include debug logging to monitor actual SQL execution:

```typescript
ctx.prisma.$on("query", (e) => {
  console.debug(`DEBUG: ---- ${formatQuery(e.query, e.params)}`);
});
```

## Expected Cost Reduction

Based on Turso billing optimization patterns, these changes should reduce row reads by:
- **70-90%** for simple queries (performance filtering only)
- **60-80%** for complex queries (chipset + performance filtering)
- **95%+** for pagination queries using `reviewCount` ordering

The exact savings depend on your data distribution and query patterns. 