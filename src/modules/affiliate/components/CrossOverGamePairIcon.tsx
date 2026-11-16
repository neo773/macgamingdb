import { isNonEmptyArray } from '@sniptt/guards';
import { Plus } from 'lucide-react';
import { Picture } from 'macgamingdb-ui/display/Picture';

type CrossOverGamePairIconProps = {
  gameArtworkUrls: string[];
};

const TILE_CLASS_NAME =
  'size-12 shrink-0 rounded-xl ring-4 ring-[#0b0d0e] shadow-lg shadow-black/60 sm:size-14 sm:rounded-2xl';

export const CrossOverGamePairIcon = ({
  gameArtworkUrls,
}: CrossOverGamePairIconProps) => {
  const crossOverTile = (
    <Picture src="/images/crossover.png" alt="" className={TILE_CLASS_NAME} />
  );

  if (!isNonEmptyArray(gameArtworkUrls)) {
    return crossOverTile;
  }

  return (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      <div
        className={`${TILE_CLASS_NAME} bg-[#1a1a1a] bg-cover bg-[center_20%]`}
        style={{
          backgroundImage: gameArtworkUrls
            .map((artworkUrl) => `url("${artworkUrl}")`)
            .join(', '),
        }}
      />
      <span className="relative z-10 -mx-2 flex size-5 items-center justify-center rounded-full bg-white text-black ring-4 ring-[#0b0d0e] sm:-mx-2.5 sm:size-6">
        <Plus className="size-3 sm:size-3.5" strokeWidth={3} />
      </span>
      {crossOverTile}
    </div>
  );
};
