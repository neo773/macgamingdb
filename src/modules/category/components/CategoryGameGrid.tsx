'use client';

import { trpc } from '@/modules/trpc/trpc';
import { type RouterOutputs } from '@/modules/trpc/types/RouterOutputs';
import { GameGrid } from '@/modules/home/components/GameGrid';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { buildCategoryGamesInput } from '@/modules/category/utils/buildCategoryGamesInput';
import { type GameCategory } from '@/modules/category/types/GameCategory';

const CATEGORY_STALE_TIME_MS = 30000;

type CategoryGameGridProps = {
  category: Pick<GameCategory, 'chipset' | 'playMethod' | 'genre'>;
  initialGamesPage: RouterOutputs['game']['getGames'];
};

export const CategoryGameGrid = ({
  category,
  initialGamesPage,
}: CategoryGameGridProps) => {
  const {
    data: gamesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.game.getGames.useInfiniteQuery(buildCategoryGamesInput(category), {
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: CATEGORY_STALE_TIME_MS,
    initialData: { pages: [initialGamesPage], pageParams: [undefined] },
  });

  const loadMoreRef = useInfiniteScroll<HTMLDivElement>({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const games = gamesData?.pages.flatMap((page) => page.games) ?? [];

  return (
    <>
      <GameGrid
        isLoading={isLoading}
        searchResults={null}
        games={games}
        isFetchingNextPage={isFetchingNextPage}
      />

      {hasNextPage && (
        <div ref={loadMoreRef} className="w-full h-20 mt-8" aria-hidden />
      )}
    </>
  );
};
